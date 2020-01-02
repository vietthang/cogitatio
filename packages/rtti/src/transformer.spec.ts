import { GenerateClassRtti, getClassRtti } from './decorators'
import { Kind } from './types'

describe('Test Transformer', () => {
  it('should work for simple primitive types', () => {
    @GenerateClassRtti
    class TestClass {
      public boolean!: boolean
      public number!: number
      public string!: string
      public bigint!: bigint
      public null!: null
      public undefined!: undefined
      public any!: any
      public unknown!: unknown
      public never!: never
      public void!: void
    }

    const runtimeType = getClassRtti(TestClass)

    expect(runtimeType).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'boolean',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Boolean',
          },
        },
        {
          name: 'number',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Number',
          },
        },
        {
          name: 'string',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'bigint',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'BigInt',
          },
        },
        {
          name: 'null',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Null',
          },
        },
        {
          name: 'undefined',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Undefined',
          },
        },
        {
          name: 'any',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Any',
          },
        },
        {
          name: 'unknown',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Unknown',
          },
        },
        {
          name: 'never',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Never',
          },
        },
        {
          name: 'void',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Void',
          },
        },
      ],
    })
  })

  it('should work with literals', () => {
    enum Gender {
      Unspecified = '0Unspecified',
      Male = '1Male',
      Female = '2Female',
    }

    @GenerateClassRtti
    class TestClass {
      public true!: true
      public false!: false
      public number!: 10
      public string!: 'foo'
      public bigint!: 100n
      public gender!: Gender.Unspecified
    }

    const runtimeType = getClassRtti(TestClass)

    expect(runtimeType).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'true',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Literal',
            value: true,
          },
        },
        {
          name: 'false',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Literal',
            value: false,
          },
        },
        {
          name: 'number',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Literal',
            value: 10,
          },
        },
        {
          name: 'string',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Literal',
            value: 'foo',
          },
        },
        {
          name: 'bigint',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Literal',
            value: {
              negative: false,
              base10Value: '100',
            },
          },
        },
        {
          name: 'gender',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Literal',
            fqn: 'Gender.Unspecified',
            value: Gender.Unspecified,
          },
        },
      ],
    })
  })

  it('should work with array', () => {
    @GenerateClassRtti
    class TestClass {
      public strings!: string[]

      // tslint:disable-next-line
      public stringArray!: Array<string>

      public readonlyStrings!: ReadonlyArray<string>
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'strings',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'Array',
            typeArguments: [
              {
                kind: 'String',
              },
            ],
            typeParameters: [],
          },
        },
        {
          name: 'stringArray',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'Array',
            typeArguments: [
              {
                kind: 'String',
              },
            ],
            typeParameters: [],
          },
        },
        {
          name: 'readonlyStrings',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'ReadonlyArray',
            typeArguments: [
              {
                kind: 'String',
              },
            ],
            typeParameters: [],
          },
        },
      ],
    })
  })

  it('should work for enum', () => {
    enum Gender {
      Unspecified = '0Unspecified',
      Male = '1Male',
      Female = '2Female',
    }
    @GenerateClassRtti
    class TestClass {
      public gender!: Gender
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'gender',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Enum',
            fqn: 'Gender',
            values: [
              {
                name: 'Unspecified',
                value: '0Unspecified',
              },
              {
                name: 'Male',
                value: '1Male',
              },
              {
                name: 'Female',
                value: '2Female',
              },
            ],
          },
        },
      ],
    })
  })

  it('should work with modifiers', () => {
    @GenerateClassRtti
    class TestClass {
      public optional?: string

      public readonly readonly!: string

      public public!: string

      protected protected!: string

      private private!: string

      // tslint:disable-next-line
      noModifier!: string
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'optional',
          optional: true,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Union',
            elementTypes: [
              {
                kind: 'Undefined',
              },
              {
                kind: 'String',
              },
            ],
          },
        },
        {
          name: 'readonly',
          optional: false,
          readonly: true,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'public',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'protected',
          optional: false,
          readonly: false,
          scope: 'protected',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'private',
          optional: false,
          readonly: false,
          scope: 'private',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'noModifier',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
      ],
    })
  })

  it('should work with tuple', () => {
    @GenerateClassRtti
    class TestClass {
      public tuple!: [string, number, boolean]
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'tuple',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Tuple',
            elementTypes: [
              {
                kind: 'String',
              },
              {
                kind: 'Number',
              },
              {
                kind: 'Boolean',
              },
            ],
          },
        },
      ],
    })
  })

  it('should work with promise', () => {
    @GenerateClassRtti
    class TestClass {
      public promise!: Promise<string>
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'promise',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'Promise',
            typeArguments: [
              {
                kind: 'String',
              },
            ],
            typeParameters: [],
          },
        },
      ],
    })
  })

  it('should work with well-known types', () => {
    @GenerateClassRtti
    class TestClass {
      public date!: Date
      public buffer!: Buffer
      public arrayBuffer!: ArrayBuffer
      public int8Array!: Int8Array
      public uint8Array!: Uint8Array
      public uint8ClampedArray!: Uint8ClampedArray
      public int16Array!: Int16Array
      public uint16Array!: Uint16Array
      public int32Array!: Int32Array
      public uint32Array!: Uint32Array
      public float32Array!: Float32Array
      public float64Array!: Float64Array
      public bigInt64Array!: BigInt64Array
      public bigUint64Array!: BigUint64Array
      public regex!: RegExp
      public url!: URL
      public map!: Map<string, number>
      public set!: Set<string>
      public weakMap!: WeakMap<any, number>
      public weakSet!: WeakSet<any>
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'date',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Date',
          },
        },
        {
          name: 'buffer',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Buffer',
          },
        },
        {
          name: 'arrayBuffer',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'ArrayBuffer',
          },
        },
        {
          name: 'int8Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Int8Array',
          },
        },
        {
          name: 'uint8Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Uint8Array',
          },
        },
        {
          name: 'uint8ClampedArray',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Uint8ClampedArray',
          },
        },
        {
          name: 'int16Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Int16Array',
          },
        },
        {
          name: 'uint16Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Uint16Array',
          },
        },
        {
          name: 'int32Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Int32Array',
          },
        },
        {
          name: 'uint32Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Uint32Array',
          },
        },
        {
          name: 'float32Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Float32Array',
          },
        },
        {
          name: 'float64Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'Float64Array',
          },
        },
        {
          name: 'bigInt64Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'BigInt64Array',
          },
        },
        {
          name: 'bigUint64Array',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'BigUint64Array',
          },
        },
        {
          name: 'regex',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'RegExp',
          },
        },
        {
          name: 'url',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            typeParameters: [],
            typeArguments: [],
            fqn: 'URL',
          },
        },
        {
          name: 'map',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'Map',
            typeArguments: [
              {
                kind: 'String',
              },
              {
                kind: 'Number',
              },
            ],
            typeParameters: [],
          },
        },
        {
          name: 'set',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'Set',
            typeArguments: [
              {
                kind: 'String',
              },
            ],
            typeParameters: [],
          },
        },
        {
          name: 'weakMap',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'WeakMap',
            typeArguments: [
              {
                kind: 'Any',
              },
              {
                kind: 'Number',
              },
            ],
            typeParameters: [],
          },
        },
        {
          name: 'weakSet',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Wellknown',
            fqn: 'WeakSet',
            typeArguments: [
              {
                kind: 'Any',
              },
            ],
            typeParameters: [],
          },
        },
      ],
    })
  })

  it('should work with union & intersection types', () => {
    @GenerateClassRtti
    class TestClass {
      public union!: string | number
      public intersection!: string & { foo: string }
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'union',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Union',
            elementTypes: [
              {
                kind: 'String',
              },
              {
                kind: 'Number',
              },
            ],
          },
        },
        {
          name: 'intersection',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Intersection',
            elementTypes: [
              {
                kind: 'String',
              },
              {
                kind: 'Object',
                callSignatures: [],
                constructSignatures: [],
                typeArguments: [],
                typeParameters: [],
                properties: [
                  {
                    name: 'foo',
                    optional: false,
                    readonly: false,
                    scope: 'public',
                    type: {
                      kind: 'String',
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    })
  })

  it('should work with nested object type', () => {
    interface Nested {
      foo: string
    }

    @GenerateClassRtti
    class TestClass {
      public nested!: Nested
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'nested',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Object',
            callSignatures: [],
            constructSignatures: [],
            typeArguments: [],
            typeParameters: [],
            properties: [
              {
                name: 'foo',
                optional: false,
                readonly: false,
                scope: 'public',
                type: {
                  kind: 'String',
                },
              },
            ],
          },
        },
      ],
    })
  })

  it('should work with nested object class', () => {
    class NestedClass {
      public foo!: string
    }

    @GenerateClassRtti
    class TestClass {
      public nested!: NestedClass
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'nested',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Object',
            callSignatures: [],
            constructSignatures: [],
            typeArguments: [],
            typeParameters: [],
            properties: [
              {
                name: 'foo',
                optional: false,
                readonly: false,
                scope: 'public',
                type: {
                  kind: 'String',
                },
              },
            ],
          },
        },
      ],
    })
  })

  it('should not support generic type', () => {
    @GenerateClassRtti
    class TestClass<T> {
      public value!: T
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      properties: [
        {
          name: 'value',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            fqn: 'TestClass.T',
            kind: 'Unsupported',
          },
        },
      ],
      typeParameters: [
        {
          fqn: 'TestClass.T',
          kind: 'Unsupported',
        },
      ],
      typeArguments: [
        {
          fqn: 'TestClass.T',
          kind: 'Unsupported',
        },
      ],
    })
  })

  it('should work with method & arrow function', () => {
    @GenerateClassRtti
    class TestClass {
      public method(arg0: string, arg1: number): string {
        return arg0 + arg1
      }
      public arrow = (arg0: string, arg1: number): string => arg0 + arg1
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'method',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Object',
            callSignatures: [
              {
                params: [
                  {
                    name: 'arg0',
                    type: {
                      kind: 'String',
                    },
                  },
                  {
                    name: 'arg1',
                    type: {
                      kind: 'Number',
                    },
                  },
                ],
                returnType: {
                  kind: 'String',
                },
              },
            ],
            constructSignatures: [],
            typeArguments: [],
            typeParameters: [],
            properties: [],
          },
        },
        {
          name: 'arrow',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'Object',
            callSignatures: [
              {
                params: [
                  {
                    name: 'arg0',
                    type: {
                      kind: 'String',
                    },
                  },
                  {
                    name: 'arg1',
                    type: {
                      kind: 'Number',
                    },
                  },
                ],
                returnType: {
                  kind: 'String',
                },
              },
            ],
            constructSignatures: [],
            typeArguments: [],
            typeParameters: [],
            properties: [],
          },
        },
      ],
    })
  })

  it('should work with inheritance', () => {
    class BaseClass {
      public foo!: string
    }

    @GenerateClassRtti
    class TestClass extends BaseClass {
      public bar0!: string

      public bar1!: string
    }

    const rtti = getClassRtti(TestClass)
    expect(rtti).toEqual({
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'bar0',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'bar1',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
        {
          name: 'foo',
          optional: false,
          readonly: false,
          scope: 'public',
          type: {
            kind: 'String',
          },
        },
      ],
    })
  })

  it('should work with recursive type', () => {
    @GenerateClassRtti
    class TestClass {
      public sibling!: TestClass
    }

    const rtti = getClassRtti(TestClass)

    const expected = {
      kind: Kind.Object,
      callSignatures: [],
      constructSignatures: [],
      typeArguments: [],
      typeParameters: [],
      properties: [
        {
          name: 'sibling',
          optional: false,
          readonly: false,
          scope: 'public',
          type: null as any,
        },
      ],
    }
    expected.properties[0].type = expected

    expect(rtti).toEqual(expected)
  })
})
