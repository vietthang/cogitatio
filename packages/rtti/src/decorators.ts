import {
  Kind,
  ObjectType,
  RefType,
  RuntimeType,
  UnsupportedType,
} from './types'

export interface ClassRttiOptions {
  mainRef: string
  references: { [key: string]: ObjectType }
}

export const GenerateClassRtti: ClassDecorator = () => {
  throw new Error('static access only')
}

export type Constructor = new (...args: any[]) => any

const metadataMap = new WeakMap<any, ObjectType>()

// @internal
export function ClassRtti(options: ClassRttiOptions): ClassDecorator {
  function resolveObjectType(rtype: ObjectType): ObjectType {
    rtype.callSignatures.forEach(signature => {
      signature.params.forEach(param => {
        param.type = resolveType(param.type)
      })
      signature.returnType = resolveType(signature.returnType)
      signature.typeParameters = signature.typeParameters?.map(resolveType)
    })
    rtype.constructSignatures.forEach(signature => {
      signature.params.forEach(param => {
        param.type = resolveType(param.type)
      })
      signature.returnType = resolveType(signature.returnType)
      signature.typeParameters = signature.typeParameters?.map(resolveType)
    })
    rtype.properties = rtype.properties.map(prop => {
      return {
        ...prop,
        type: resolveType(prop.type),
      }
    })
    rtype.numberIndexType =
      rtype.numberIndexType && resolveType(rtype.numberIndexType)
    rtype.stringIndexType =
      rtype.stringIndexType && resolveType(rtype.stringIndexType)
    rtype.typeParameters = rtype.typeParameters?.map(resolveType)
    rtype.typeArguments = rtype.typeArguments?.map(resolveType)
    return rtype
  }

  function resolveType(rtype: RuntimeType): RuntimeType {
    switch (rtype.kind) {
      case Kind.Ref:
        return options.references[rtype.ref] || { kind: Kind.Unsupported }
      case Kind.Object:
        return resolveObjectType(rtype)
      case Kind.Tuple:
        return {
          ...rtype,
          elementTypes: rtype.elementTypes.map(resolveType),
        }
      case Kind.Union:
        return {
          ...rtype,
          elementTypes: rtype.elementTypes.map(resolveType),
        }
      case Kind.Intersection:
        return {
          ...rtype,
          elementTypes: rtype.elementTypes.map(resolveType),
        }
      case Kind.Wellknown:
        return {
          ...rtype,
          typeParameters: rtype.typeParameters?.map(resolveType),
          typeArguments: rtype.typeArguments?.map(resolveType),
        }
      default:
        return rtype
    }
  }

  return target => {
    const mainClassType = options.references[options.mainRef]

    metadataMap.set(target, resolveObjectType(mainClassType))
  }
}

export function getClassRtti(target: Constructor): ObjectType | undefined {
  return metadataMap.get(target)
}
