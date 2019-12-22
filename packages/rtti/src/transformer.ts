// tslint:disable:no-bitwise
import * as path from 'path'
import * as ts from 'typescript'
import {
  EnumValue,
  Kind,
  ObjectProperty,
  ObjectPropertyScope,
  ObjectType,
  RuntimeType,
  Signature,
  UnsupportedType,
} from './types'

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

// TODO
// there should be better approach, currently we check if the symbol is in default lib of @types/node only
function checkAndGetGlobalName(
  program: ts.Program,
  type: ts.Type,
): string | false {
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
  const declarations = typeSymbol.getDeclarations()
  if (!declarations) {
    return false
  }

  const isDefaultLibOrNodeJsLibrary = (sourceFile: ts.SourceFile): boolean => {
    if (program.isSourceFileDefaultLibrary(sourceFile)) {
      return true
    }
    if (!program.isSourceFileFromExternalLibrary(sourceFile)) {
      return false
    }
    return sourceFile.fileName.includes('@types/node')
  }

  const interfaceOrClassDeclarations = declarations.filter(declaration => {
    const sourceFile = declaration.getSourceFile()
    if (!isDefaultLibOrNodeJsLibrary(sourceFile)) {
      return false
    }

    return (
      sourceFile.statements.includes(declaration as ts.DeclarationStatement) &&
      (ts.isInterfaceDeclaration(declaration) ||
        ts.isClassDeclaration(declaration) ||
        ts.isTypeAliasDeclaration(declaration))
    )
  }) as Array<
    ts.InterfaceDeclaration | ts.ClassDeclaration | ts.TypeAliasDeclaration
  >

  if (!interfaceOrClassDeclarations.some(d => d.name)) {
    return false
  }

  const declaration = interfaceOrClassDeclarations.find(d => d.name)!
  return declaration.name!.getText()
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

function resolveEnumValues(program: ts.Program, type: ts.Type): EnumValue[] {
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
      value: program.getTypeChecker().getConstantValue(member),
    }
  })
}

function resolveSignature(
  program: ts.Program,
  signature: ts.Signature,
): Signature {
  return {
    params: signature.getParameters().map(param => {
      const declarations = param.getDeclarations()
      if (!declarations || !declarations.length) {
        throw new Error(`missing declarations for param ${param.getName()}`)
      }

      return {
        name: param.getName(),
        type: resolveType(
          program,
          program
            .getTypeChecker()
            .getTypeOfSymbolAtLocation(param, declarations[0]),
        ),
      }
    }),
    typeParameters: signature
      .getTypeParameters()
      ?.map(param => resolveType(program, param)),
    returnType: resolveType(program, signature.getReturnType()),
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
  program: ts.Program,
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
      program,
      program
        .getTypeChecker()
        .getTypeOfSymbolAtLocation(propertySymbol, declarations[0]),
    ),
  }
}

function resolveTypeArguments(
  program: ts.Program,
  type: ts.Type,
): RuntimeType[] {
  return program
    .getTypeChecker()
    .getTypeArguments(type as ts.TypeReference)
    .map(t => resolveType(program, t))
}

function resolveTypeParameters(
  program: ts.Program,
  type: ts.Type & { typeParameters?: ts.Type[] },
): RuntimeType[] {
  if (!type.typeParameters) {
    return []
  }
  return type.typeParameters.map(t => resolveType(program, t))
}

function resolveObjectType(
  program: ts.Program,
  type: ts.InterfaceType,
  fqn?: string,
): ObjectType | UnsupportedType {
  const tsNumberIndexType = type.getNumberIndexType()
  const tsStringIndexType = type.getStringIndexType()

  return {
    kind: Kind.Object,
    fqn,
    callSignatures: type
      .getCallSignatures()
      .map(signature => resolveSignature(program, signature)),
    constructSignatures: type
      .getConstructSignatures()
      .map(signature => resolveSignature(program, signature)),
    properties: type
      .getProperties()
      .map(propertySymbol => resolveProperty(program, propertySymbol)),
    numberIndexType:
      tsNumberIndexType && resolveType(program, tsNumberIndexType),
    stringIndexType:
      tsStringIndexType && resolveType(program, tsStringIndexType),
    typeParameters: resolveTypeParameters(program, type),
    typeArguments: resolveTypeParameters(program, type),
  }
}

function resolveType(program: ts.Program, type: ts.Type): RuntimeType {
  const typeChecker = program.getTypeChecker()
  const typeSymbol = type.getSymbol()
  const fqn = typeSymbol
    ? typeChecker.getFullyQualifiedName(typeSymbol)
    : undefined

  const globalName = checkAndGetGlobalName(program, type)
  if (globalName) {
    return {
      kind: Kind.Wellknown,
      fqn: globalName,
      typeArguments: resolveTypeArguments(program, type),
      typeParameters: resolveTypeParameters(program, type),
    }
  }

  if (isEnum(type)) {
    return {
      kind: Kind.Enum,
      values: resolveEnumValues(program, type),
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
      elementTypes: type.types.map(t => resolveType(program, t)),
      fqn,
    }
  }

  if (type.isIntersection()) {
    return {
      kind: Kind.Intersection,
      elementTypes: type.types.map(t => resolveType(program, t)),
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
          resolveType(program, typeParameter),
        ),
        fqn,
      }
    }

    return resolveObjectType(program, objectType)
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

      const sourceFile = variableDeclaration.getSourceFile()
      if (path.resolve(__dirname, './decorators.ts') !== sourceFile.fileName) {
        return ts.visitEachChild(node, child => visit(child), context)
      }

      const classType = typeChecker.getTypeAtLocation(node.parent)

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
              [
                ts.createLiteral(
                  JSON.stringify(resolveType(program, classType)),
                ),
              ],
            ),
          ],
        ),
      )
    }

    return node => ts.visitNode(node, visit)
  }
}
