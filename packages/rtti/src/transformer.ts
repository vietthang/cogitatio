// tslint:disable:no-bitwise
import * as crypto from 'crypto'
import * as path from 'path'
import * as ts from 'typescript'
import {
  EnumValue,
  Kind,
  ObjectProperty,
  ObjectPropertyScope,
  ObjectType,
  RefType,
  RuntimeType,
  Signature,
  UnsupportedType,
} from './types'
import { memoized } from './utils'

interface Context {
  program: ts.Program
  pendingTypes: { [ref: string]: ts.InterfaceType }
  resolvedTypes: { [ref: string]: ObjectType }
}

// generate global ref for symbol, using file path and location
// TODO: find a better way maybe, with this approach, the tests may be broken when typescript upgraded
const getSymbolGlobalRef = memoized(
  (symbol: ts.Symbol): string => {
    const hash = crypto.createHash('md5')
    const declarations = symbol.getDeclarations()!
    const data = declarations
      .map(declaration => {
        return [
          path.relative(__dirname, declaration.getSourceFile().fileName),
          declaration.getStart(),
          declaration.getEnd(),
        ].join('\0')
      })
      .sort() // to make sure the result is deterministic
      .join('\0')

    return hash.update(data).digest('base64')
  },
  symbol => symbol,
)

const getGlobalThisType = memoized(
  (program: ts.Program) => {
    const staticHelperSourceFile = program.getSourceFile(
      path.resolve(__dirname, 'static-helper.ts'),
    )
    if (!staticHelperSourceFile) {
      throw new Error('missing "static-helper.ts" file')
    }

    const globalStatement = staticHelperSourceFile.statements.find(
      statement => {
        if (!ts.isTypeAliasDeclaration(statement)) {
          return false
        }
        return statement.name.getText() === '_globalThis'
      },
    ) as ts.TypeAliasDeclaration | undefined
    if (!globalStatement) {
      throw new Error('missing _global statement')
    }

    return program.getTypeChecker().getTypeFromTypeNode(globalStatement.type)
  },
  program => program,
)

// borrow from ts-morph
function isEnum(type: ts.Type): boolean {
  const flags = type.getFlags()
  if (flags & ts.TypeFlags.Enum) {
    return true
  }

  if (flags & ts.TypeFlags.EnumLiteral) {
    if (!(flags & ts.TypeFlags.Union)) {
      return false
    }
  }

  const typeSymbol = type.getSymbol()
  if (!typeSymbol) {
    return false
  }

  const declarations = typeSymbol.getDeclarations()
  if (!declarations) {
    return false
  }

  return !!declarations.find(d => ts.isEnumDeclaration(d))
}

function isTypeInGlobal(
  program: ts.Program,
  globalType: ts.Type,
  type: ts.Type,
): boolean {
  const typeSymbol = type.getSymbol()
  if (!typeSymbol) {
    return false
  }
  const fqn = typeSymbol
    ? program.getTypeChecker().getFullyQualifiedName(typeSymbol)
    : undefined
  if (!fqn) {
    return false
  }

  const globalPropertySymbol = globalType
    .getApparentProperties()
    .find(s => s.getName() === fqn)
  if (!globalPropertySymbol) {
    return false
  }

  const globalProperyTypeSymbol = program
    .getTypeChecker()
    .getDeclaredTypeOfSymbol(globalPropertySymbol)
    .getSymbol()
  if (globalProperyTypeSymbol !== typeSymbol) {
    return false
  }

  return true
}

function isTypeInDefaultLib(program: ts.Program, type: ts.Type): boolean {
  const typeSymbol = type.getSymbol()
  if (!typeSymbol) {
    return false
  }
  const fqn = typeSymbol
    ? program.getTypeChecker().getFullyQualifiedName(typeSymbol)
    : undefined
  if (!fqn) {
    return false
  }

  return !!typeSymbol
    .getDeclarations()
    ?.find(d => program.isSourceFileDefaultLibrary(d.getSourceFile()))
}

function isTypeInStaticHelper(program: ts.Program, type: ts.Type): boolean {
  const staticHelperSourceFile = program.getSourceFile(
    path.resolve(__dirname, 'static-helper.ts'),
  )
  if (!staticHelperSourceFile) {
    throw new Error('missing "static-helper.ts" file')
  }

  return !!staticHelperSourceFile.statements.find(statement => {
    if (!ts.isModuleDeclaration(statement)) {
      return false
    }
    const typeChecker = program.getTypeChecker()
    if (statement.name.getText() !== 'global') {
      return false
    }

    if (!statement.body || !ts.isModuleBlock(statement.body)) {
      return false
    }

    return !!statement.body.statements.find(statement => {
      if (!ts.isInterfaceDeclaration(statement)) {
        return false
      }

      const statementType = typeChecker.getTypeAtLocation(statement)
      return statementType === type
    })
  })
}

function isTypeInGlobalNamespace(program: ts.Program, type: ts.Type): boolean {
  const typeSymbol = type.getSymbol()
  if (!typeSymbol) {
    return false
  }

  const fqn = typeSymbol
    ? program.getTypeChecker().getFullyQualifiedName(typeSymbol)
    : undefined
  if (!fqn) {
    return false
  }

  const globalThisType = getGlobalThisType(program)
  if (isTypeInGlobal(program, globalThisType, type)) {
    return true
  }

  if (isTypeInDefaultLib(program, type)) {
    return true
  }

  if (isTypeInStaticHelper(program, type)) {
    return true
  }

  return false
}

function isTuple(
  type: ts.InterfaceType & { target?: ts.TypeReference },
): type is ts.TupleType {
  const targetType = type.target
  if (!targetType) {
    return false
  }
  return (targetType.objectFlags & ts.ObjectFlags.Tuple) !== 0
}

function resolveEnumValues(ctx: Context, type: ts.Type): EnumValue[] {
  const typeSymbol = type.getSymbol()
  if (!typeSymbol) {
    return []
  }

  const declarations = typeSymbol.getDeclarations()
  if (!declarations) {
    return []
  }

  const enumDeclaration = declarations.find(d => ts.isEnumDeclaration(d)) as
    | ts.EnumDeclaration
    | undefined
  if (!enumDeclaration) {
    return []
  }

  return enumDeclaration.members.map(member => {
    return {
      name: member.name.getText(),
      value: ctx.program.getTypeChecker().getConstantValue(member),
    }
  })
}

function resolveSignature(ctx: Context, signature: ts.Signature): Signature {
  return {
    params: signature.getParameters().map(param => {
      const declarations = param.getDeclarations()
      if (!declarations || !declarations.length) {
        throw new Error(`missing declarations for param ${param.getName()}`)
      }

      return {
        name: param.getName(),
        type: resolveType(
          ctx,
          ctx.program
            .getTypeChecker()
            .getTypeOfSymbolAtLocation(param, declarations[0]),
        ),
      }
    }),
    typeParameters: signature
      .getTypeParameters()
      ?.map(param => resolveType(ctx, param)),
    returnType: resolveType(ctx, signature.getReturnType()),
  }
}

function resolveModifierFlagsToScope(
  flags: ts.ModifierFlags,
): ObjectPropertyScope {
  if (flags & ts.ModifierFlags.Private) {
    return ObjectPropertyScope.Private
  }

  if (flags & ts.ModifierFlags.Protected) {
    return ObjectPropertyScope.Protected
  }

  if (flags & ts.ModifierFlags.Public) {
    return ObjectPropertyScope.Public
  }

  return ObjectPropertyScope.Public
}

function resolveProperty(
  ctx: Context,
  propertySymbol: ts.Symbol,
): ObjectProperty {
  const declarations = propertySymbol.getDeclarations()
  if (!declarations || !declarations.length) {
    throw new Error(
      `missing declarations for param ${propertySymbol.getName()}`,
    )
  }

  const modifierFlags: ts.ModifierFlags = declarations.reduce(
    (flags, declaration) => {
      return flags | ts.getCombinedModifierFlags(declaration)
    },
    ts.ModifierFlags.None,
  )

  return {
    name: propertySymbol.getName(),
    readonly:
      (modifierFlags & ts.ModifierFlags.Readonly) !== ts.ModifierFlags.None,
    optional:
      (propertySymbol.flags & ts.SymbolFlags.Optional) !== ts.SymbolFlags.None,
    scope: resolveModifierFlagsToScope(modifierFlags),
    type: resolveType(
      ctx,
      ctx.program
        .getTypeChecker()
        .getTypeOfSymbolAtLocation(propertySymbol, declarations[0]),
    ),
  }
}

function resolveTypeArguments(ctx: Context, type: ts.Type): RuntimeType[] {
  return ctx.program
    .getTypeChecker()
    .getTypeArguments(type as ts.TypeReference)
    .map(t => resolveType(ctx, t))
}

function resolveTypeParameters(
  ctx: Context,
  type: ts.Type & { typeParameters?: ts.Type[] },
): RuntimeType[] {
  if (!type.typeParameters) {
    return []
  }
  return type.typeParameters.map(t => resolveType(ctx, t))
}

function resolveObjectType(ctx: Context, type: ts.InterfaceType): ObjectType {
  const tsNumberIndexType = type.getNumberIndexType()
  const tsStringIndexType = type.getStringIndexType()

  return {
    kind: Kind.Object,
    callSignatures: type
      .getCallSignatures()
      .map(signature => resolveSignature(ctx, signature)),
    constructSignatures: type
      .getConstructSignatures()
      .map(signature => resolveSignature(ctx, signature)),
    properties: type
      .getProperties()
      .map(propertySymbol => resolveProperty(ctx, propertySymbol)),
    numberIndexType: tsNumberIndexType && resolveType(ctx, tsNumberIndexType),
    stringIndexType: tsStringIndexType && resolveType(ctx, tsStringIndexType),
    typeParameters: resolveTypeParameters(ctx, type),
    typeArguments: resolveTypeParameters(ctx, type),
  }
}

function resolveRefType(
  ctx: Context,
  type: ts.InterfaceType,
): RefType | UnsupportedType {
  const typeChecker = ctx.program.getTypeChecker()
  const typeSymbol = type.getSymbol()
  if (!typeSymbol) {
    return { kind: Kind.Unsupported }
  }
  return {
    kind: Kind.Ref,
    ref: getSymbolGlobalRef(typeSymbol),
    fqn: typeChecker.getFullyQualifiedName(typeSymbol),
    typeParameters: resolveTypeParameters(ctx, type),
    typeArguments: resolveTypeParameters(ctx, type),
  }
}

function resolveType(ctx: Context, type: ts.Type): RuntimeType {
  const typeChecker = ctx.program.getTypeChecker()
  const typeSymbol = type.getSymbol()
  const fqn = typeSymbol
    ? typeChecker.getFullyQualifiedName(typeSymbol)
    : undefined

  if (typeSymbol && fqn && isTypeInGlobalNamespace(ctx.program, type)) {
    return {
      kind: Kind.Wellknown,
      fqn,
      typeArguments: resolveTypeArguments(ctx, type),
      typeParameters: resolveTypeParameters(ctx, type),
    }
  }

  if (isEnum(type)) {
    return {
      kind: Kind.Enum,
      values: resolveEnumValues(ctx, type),
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.EnumLiteral) {
    return {
      kind: Kind.Literal,
      value: (type as ts.LiteralType).value,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    // TODO may cause backward compatible issue, find a better way to figure out if type is true or false
    switch ((type as any).intrinsicName) {
      case 'false':
        return {
          kind: Kind.Literal,
          value: false,
          fqn,
        }
      case 'true':
        return {
          kind: Kind.Literal,
          value: true,
          fqn,
        }
      default:
        return {
          kind: Kind.Unsupported,
          fqn,
        }
    }
  }

  if (type.flags & ts.TypeFlags.NumberLiteral) {
    return {
      kind: Kind.Literal,
      value: (type as ts.LiteralType).value,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.StringLiteral) {
    return {
      kind: Kind.Literal,
      value: (type as ts.LiteralType).value,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.BigIntLiteral) {
    const literalValue = (type as ts.BigIntLiteralType).value
    return {
      kind: Kind.Literal,
      value: literalValue,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Boolean) {
    return {
      kind: Kind.Boolean,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Number) {
    return {
      kind: Kind.Number,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.String) {
    return {
      kind: Kind.String,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.BigInt) {
    return {
      kind: Kind.BigInt,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Unknown) {
    return {
      kind: Kind.Unknown,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Any) {
    return {
      kind: Kind.Any,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Null) {
    return {
      kind: Kind.Null,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Undefined) {
    return {
      kind: Kind.Undefined,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Void) {
    return {
      kind: Kind.Void,
      fqn,
    }
  }

  if (type.flags & ts.TypeFlags.Never) {
    return {
      kind: Kind.Never,
      fqn,
    }
  }

  if (type.isUnion()) {
    return {
      kind: Kind.Union,
      elementTypes: type.types.map(t => resolveType(ctx, t)),
      fqn,
    }
  }

  if (type.isIntersection()) {
    return {
      kind: Kind.Intersection,
      elementTypes: type.types.map(t => resolveType(ctx, t)),
      fqn,
    }
  }

  if (type.getFlags() & ts.TypeFlags.Object) {
    const objectType = type as ts.InterfaceType
    if (isTuple(objectType)) {
      const typeArguments = typeChecker.getTypeArguments(
        type as ts.TypeReference,
      )

      return {
        kind: Kind.Tuple,
        elementTypes: typeArguments.map(typeParameter =>
          resolveType(ctx, typeParameter),
        ),
        fqn,
      }
    }

    if (!typeSymbol || !fqn) {
      throw new Error('object type without symbol')
    }

    const ref = getSymbolGlobalRef(typeSymbol)
    // not in pending or resolved list
    if (!ctx.pendingTypes[ref] && !ctx.resolvedTypes[ref]) {
      ctx.pendingTypes[ref] = type as ts.InterfaceType
    }

    return {
      kind: Kind.Ref,
      ref,
      fqn,
      typeParameters: resolveTypeParameters(ctx, type),
      typeArguments: resolveTypeParameters(ctx, type),
    }
  }

  return {
    kind: Kind.Unsupported,
    fqn,
  }
}

// @internal
export default function transformer<T extends ts.Node>(
  program: ts.Program,
): ts.TransformerFactory<T> {
  const typeChecker = program.getTypeChecker()

  return context => {
    const visit: ts.Visitor = node => {
      // filter to get decorator node
      if (!ts.isDecorator(node)) {
        return ts.visitEachChild(node, child => visit(child), context)
      }

      // filter only class decorator
      if (!ts.isClassDeclaration(node.parent)) {
        return ts.visitEachChild(node, child => visit(child), context)
      }

      // filter to decorator that is identifier
      const decoratorExpr = node.expression
      if (!ts.isIdentifier(decoratorExpr)) {
        return ts.visitEachChild(node, child => visit(child), context)
      }

      const decoratorExprSymbol = typeChecker.getSymbolAtLocation(decoratorExpr)
      if (!decoratorExprSymbol) {
        throw new Error('decorator symbol not found?')
      }

      // the following step filter only identifier with original symbol in './decorators.ts' file & is exported
      // variable named "GenerateClassRtti"
      const originalSymbol = typeChecker.getAliasedSymbol(decoratorExprSymbol)
      if (originalSymbol.getName() !== 'GenerateClassRtti') {
        return ts.visitEachChild(node, child => visit(child), context)
      }

      const variableDeclaration = originalSymbol
        .getDeclarations()
        ?.find(d => ts.isVariableDeclaration(d)) as
        | ts.VariableDeclaration
        | undefined
      if (!variableDeclaration) {
        return ts.visitEachChild(node, child => visit(child), context)
      }

      const classType = typeChecker.getTypeAtLocation(
        node.parent,
      ) as ts.InterfaceType

      const mainRef = getSymbolGlobalRef(classType.getSymbol()!)

      const ctx: Context = {
        program,
        resolvedTypes: {},
        pendingTypes: {
          [mainRef]: classType,
        },
      }

      while (Object.keys(ctx.pendingTypes).length > 0) {
        Object.entries(ctx.pendingTypes).forEach(([key, pendingType]) => {
          const runtimeType = resolveObjectType(ctx, pendingType)
          ctx.resolvedTypes[key] = runtimeType
          delete ctx.pendingTypes[key]
        })
      }

      const options: import('./decorators').ClassRttiOptions = {
        mainRef,
        references: ctx.resolvedTypes,
      }

      return ts.createDecorator(
        ts.createCall(
          ts.createPropertyAccess(
            ts.createCall(ts.createIdentifier('require'), undefined, [
              ts.createLiteral('@cogitatio/rtti'),
            ]),
            'ClassRtti',
          ),
          undefined,
          [
            ts.createCall(
              ts.createPropertyAccess(ts.createIdentifier('JSON'), 'parse'),
              undefined,
              [ts.createLiteral(JSON.stringify(options))],
            ),
          ],
        ),
      )
    }

    return node => ts.visitNode(node, visit)
  }
}
