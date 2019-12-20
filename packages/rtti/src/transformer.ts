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

function getPropertyType(
  typeChecker: ts.TypeChecker,
  type: ts.ObjectType,
  name: string,
): ts.Type | undefined {
  const propertySymbol = type.getProperty(name)
  if (!propertySymbol) {
    return undefined
  }
  const declarations = propertySymbol.getDeclarations()
  if (!declarations) {
    return undefined
  }

  const propertyDeclaration = declarations.find(c =>
    ts.isPropertyDeclaration(c),
  ) as ts.PropertyDeclaration | undefined
  if (propertyDeclaration) {
    if (!propertyDeclaration.type) {
      throw new Error('missing type in property declaration')
    }
    return typeChecker.getTypeFromTypeNode(propertyDeclaration.type)
  }

  const methodDeclaration = declarations.find(c =>
    ts.isMethodDeclaration(c),
  ) as ts.MethodDeclaration | undefined
  if (methodDeclaration) {
    if (!methodDeclaration.type) {
      throw new Error('missing type in property declaration')
    }
    return typeChecker.getTypeFromTypeNode(methodDeclaration.type)
  }

  throw new Error(`can not resolve type for property "${name}"`)
}

function isArrayLikeType(
  typeChecker: ts.TypeChecker,
  type: ts.InterfaceType,
): boolean {
  const typeParameters = type.typeParameters
  if (!typeParameters || typeParameters.length !== 1) {
    return false
  }

  const elementType = typeParameters[0]
  if (type.getNumberIndexType() !== elementType) {
    return false
  }

  const lengthType = getPropertyType(typeChecker, type, 'length')
  if (!lengthType) {
    return false
  }

  return (type.getFlags() & ts.TypeFlags.Number) !== 0
}

function isPromiseLikeType(
  typeChecker: ts.TypeChecker,
  type: ts.InterfaceType,
): boolean {
  const typeParameters = type.typeParameters
  if (!typeParameters || typeParameters.length !== 1) {
    return false
  }

  const resolveType = typeParameters[0]

  const thenType = getPropertyType(typeChecker, type, 'then')
  if (!thenType) {
    return false
  }

  const signatures = thenType.getCallSignatures()

  return signatures.some(signature => signature.getReturnType() === resolveType)
}

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

function isTuple(
  type: ts.InterfaceType & { target?: ts.TypeReference },
): type is ts.TupleType {
  const targetType = type.target
  if (!targetType) {
    return false
  }
  return (targetType.objectFlags & ts.ObjectFlags.Tuple) !== 0
}

function resolveEnumValues(
  typeChecker: ts.TypeChecker,
  type: ts.Type,
): EnumValue[] {
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
      value: typeChecker.getConstantValue(member),
    }
  })
}

function resolveSignature(
  typeChecker: ts.TypeChecker,
  signature: ts.Signature,
): Signature {
  return {
    params: signature.getParameters().map(param => {
      const declarations = param.getDeclarations()
      if (!declarations) {
        throw new Error(`missing declarations for param ${param.getName()}`)
      }

      const parameterDeclaration = declarations.find(d => ts.isParameter(d)) as
        | ts.ParameterDeclaration
        | undefined
      if (!parameterDeclaration) {
        throw new Error(
          `missing parameter declaration for param ${param.getName()}`,
        )
      }

      const parameterType = parameterDeclaration.type
      if (!parameterType) {
        throw new Error(
          `missing type for parameter declaration for param ${param.getName()}`,
        )
      }

      return {
        name: param.getName(),
        type: resolveType(
          typeChecker,
          typeChecker.getTypeFromTypeNode(parameterType),
        ),
      }
    }),
    typeParameters: signature
      .getTypeParameters()
      ?.map(param => resolveType(typeChecker, param)),
    returnType: resolveType(typeChecker, signature.getReturnType()),
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
  typeChecker: ts.TypeChecker,
  propertySymbol: ts.Symbol,
): ObjectProperty {
  const declarations = propertySymbol.getDeclarations()
  if (!declarations) {
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
      typeChecker,
      typeChecker.getTypeOfSymbolAtLocation(propertySymbol, declarations[0]),
    ),
  }
}

function resolveTypeArguments(
  typeChecker: ts.TypeChecker,
  type: ts.Type,
): RuntimeType[] {
  return typeChecker
    .getTypeArguments(type as ts.TypeReference)
    .map(t => resolveType(typeChecker, t))
}

function resolveTypeParameters(
  typeChecker: ts.TypeChecker,
  type: ts.Type & { typeParameters?: ts.Type[] },
): RuntimeType[] {
  if (!type.typeParameters) {
    return []
  }
  return type.typeParameters.map(t => resolveType(typeChecker, t))
}

function resolveObjectType(
  typeChecker: ts.TypeChecker,
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
      .map(signature => resolveSignature(typeChecker, signature)),
    constructSignatures: type
      .getConstructSignatures()
      .map(signature => resolveSignature(typeChecker, signature)),
    properties: type
      .getProperties()
      .map(propertySymbol => resolveProperty(typeChecker, propertySymbol)),
    numberIndexType:
      tsNumberIndexType && resolveType(typeChecker, tsNumberIndexType),
    stringIndexType:
      tsStringIndexType && resolveType(typeChecker, tsStringIndexType),
    typeParameters: resolveTypeParameters(typeChecker, type),
    typeArguments: resolveTypeParameters(typeChecker, type),
  }
}

function resolveType(typeChecker: ts.TypeChecker, type: ts.Type): RuntimeType {
  const typeSymbol = type.getSymbol()
  const fqn = typeSymbol
    ? typeChecker.getFullyQualifiedName(typeSymbol)
    : undefined

  switch (fqn) {
    case 'Date':
    case 'Buffer':
    case 'URL':
    case 'RegExp':
    case 'ArrayBuffer':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      return { kind: Kind.Wellknown, fqn }

    case 'Array':
    case 'ReadonlyArray': {
      const typeArguments = typeChecker.getTypeArguments(
        type as ts.TypeReference,
      )
      return {
        kind: Kind.Array,
        fqn,
        elementType: resolveType(typeChecker, typeArguments[0]),
      }
    }

    case 'Map':
    case 'ReadonlyMap': {
      return {
        kind: Kind.Wellknown,
        fqn: 'Map',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }

    case 'Set':
    case 'ReadonlySet': {
      return {
        kind: Kind.Wellknown,
        fqn: 'Set',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }

    case 'WeakMap':
    case 'ReadonlyWeakMap': {
      return {
        kind: Kind.Wellknown,
        fqn: 'WeakMap',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }

    case 'WeakSet':
    case 'ReadonlyWeakSet': {
      return {
        kind: Kind.Wellknown,
        fqn: 'WeakSet',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }

    case 'Promise': {
      return {
        kind: Kind.Wellknown,
        fqn: 'Promise',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }

    case 'Iterator': {
      return {
        kind: Kind.Wellknown,
        fqn: 'Iterator',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }

    case 'AsyncIterator': {
      return {
        kind: Kind.Wellknown,
        fqn: 'AsyncIterator',
        typeArguments: resolveTypeArguments(typeChecker, type),
        typeParameters: resolveTypeParameters(typeChecker, type),
      }
    }
  }

  if (isEnum(type)) {
    return {
      kind: Kind.Enum,
      values: resolveEnumValues(typeChecker, type),
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
      fqn: 'number',
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
      elementTypes: type.types.map(t => resolveType(typeChecker, t)),
      fqn,
    }
  }

  if (type.isIntersection()) {
    return {
      kind: Kind.Intersection,
      elementTypes: type.types.map(t => resolveType(typeChecker, t)),
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
          resolveType(typeChecker, typeParameter),
        ),
        fqn,
      }
    }

    return resolveObjectType(typeChecker, objectType)
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
                  JSON.stringify(resolveType(typeChecker, classType)),
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
