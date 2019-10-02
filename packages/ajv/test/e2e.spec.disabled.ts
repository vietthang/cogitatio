// import {
//   Dictionary,
//   Enum,
//   List,
//   Nullable,
//   Optional,
//   Property,
//   SchemaLike,
//   TaggedUnion,
//   Tuple,
//   resolveSchema,
// } from '@cogitatio/core'
// import { AjvDecoder } from '../src/decoder'

// const testCases: Array<{
//   name: string
//   schema: SchemaLike
//   cases: Array<{
//     input: any
//     expected?: any
//     throws?: boolean
//   }>
// }> = [
//   {
//     name: 'boolean',
//     schema: Boolean,
//     cases: [
//       {
//         input: 0,
//         throws: true,
//       },
//       {
//         input: {},
//         throws: true,
//       },
//       {
//         input: 'foo',
//         throws: true,
//       },
//       {
//         input: 100n,
//         throws: true,
//       },
//       {
//         input: 'true',
//         expected: true,
//       },
//       {
//         input: true,
//         expected: true,
//       },
//       {
//         input: 'false',
//         expected: false,
//       },
//       {
//         input: false,
//         expected: false,
//       },
//     ],
//   },
//   {
//     name: 'number',
//     schema: Number,
//     cases: [
//       {
//         input: {},
//         throws: true,
//       },
//       {
//         input: 'foo',
//         throws: true,
//       },
//       {
//         input: 100n,
//         throws: true,
//       },
//       {
//         input: '1',
//         expected: 1,
//       },
//       {
//         input: '1.1',
//         expected: 1.1,
//       },
//       {
//         input: 1,
//         expected: 1,
//       },
//       {
//         input: 1.1,
//         expected: 1.1,
//       },
//     ],
//   },
//   {
//     name: 'string',
//     schema: String,
//     cases: [
//       {
//         input: {},
//         throws: true,
//       },
//       {
//         input: 'foo',
//         expected: 'foo',
//       },
//       {
//         input: 100n,
//         throws: true,
//       },
//       {
//         input: 1,
//         throws: true,
//       },
//       {
//         input: 1.1,
//         throws: true,
//       },
//     ],
//   },
//   {
//     name: 'date',
//     schema: Date,
//     cases: [
//       {
//         input: {},
//         throws: true,
//       },
//       {
//         input: 'foo',
//         throws: true,
//       },
//       {
//         input: 100n,
//         throws: true,
//       },
//       {
//         input: '2020-01-01T00:00:00.000Z',
//         expected: '2020-01-01T00:00:00.000Z',
//       },
//       {
//         input: '2020-01-01T00:00:00.000+07:00',
//         expected: '2020-01-01T00:00:00.000+07:00',
//       },
//     ],
//   },
// ]

// describe('e2e', () => {
//   const decoder = new AjvDecoder()

//   testCases.forEach(({ name, schema, cases }) => {
//     describe(name, () => {
//       for (const { input, expected, throws } of cases) {
//         it(`${input} => ${throws ? 'throws' : expected}`, () => {
//           if (throws) {
//             return expect(decoder.decode(schema, input)).rejects
//           }

//           return expect(decoder.decode(schema, input)).resolves.toStrictEqual(
//             expected,
//           )
//         })
//       }
//     })
//   })
// })

// /*
//  * describe('validate primitive', () => {
//  *   const decoder = new AjvDecoder()
//  */

// /*
//  *   describe('boolean', () => {
//  *     const validate = (i: unknown): Promise<any> => decoder.decode(Boolean, i)
//  */

// /*
//  *     it('should failed with non-boolean value', () => {
//  *       assert.throws(() => validate(0))
//  *       assert.throws(() => validate({}))
//  *       assert.throws(() => validate('foo'))
//  *       assert.throws(() => validate(100n))
//  *     })
//  */

// /*
//  *     it('should success with boolean value', async () => {
//  *       assert.strictEqual(true, await validate('true'))
//  *       assert.strictEqual(false, await validate('false'))
//  *       assert.strictEqual(true, await validate(true))
//  *       assert.strictEqual(false, await validate(false))
//  *     })
//  *   })
//  */

// /*
//  *   describe('number', () => {
//  *     const validate = (i: unknown): Promise<any> => decoder.decode(Number, i)
//  */

// /*
//  *     it('should failed with non-number value', () => {
//  *       assert.throws(() => validate({}))
//  *       assert.throws(() => validate('foo'))
//  *       assert.throws(() => validate(100n))
//  *     })
//  */

// /*
//  *     it('should success with number value', () => {
//  *       assert.strictEqual(1, validate('1'))
//  *       assert.strictEqual(1.1, validate('1.1'))
//  *       assert.strictEqual(1.1, validate(1.1))
//  *       assert.strictEqual(1, validate(1))
//  *     })
//  *   })
//  */

// /*
//  *   describe('string', () => {
//  *     const validate = decoder.decode(resolveSchema(String))
//  */

// /*
//  *     it('should failed with non-string value', () => {
//  *       assert.throws(() => validate(0))
//  *       assert.throws(() => validate({}))
//  *       assert.throws(() => validate(false))
//  *       assert.throws(() => validate(100n))
//  *     })
//  */

// /*
//  *     it('should success with string value', () => {
//  *       assert.strictEqual('foo', validate('foo'))
//  *     })
//  *   })
//  */

// /*
//  *   describe('bigint', () => {
//  *     const validate = decoder.decode(resolveSchema(String))
//  */

// /*
//  *     it('should failed with any value', () => {
//  *       assert.throws(() => validate(0))
//  *       assert.throws(() => validate({}))
//  *       assert.throws(() => validate(false))
//  *       assert.throws(() => validate(100n))
//  *     })
//  *   })
//  */

// /*
//  *   describe('date', () => {
//  *     const validate = decoder.decode(resolveSchema(Date))
//  */

// /*
//  *     it('should failed with invalid date value', () => {
//  *       assert.throws(() => validate({}))
//  *       assert.throws(() => validate('foo'))
//  *       assert.throws(() => validate(false))
//  *       assert.throws(() => validate(100n))
//  *     })
//  */

// /*
//  *     it('should success with date value', () => {
//  *       const date = new Date(2019, 0, 1)
//  *       assert.deepStrictEqual(date, validate(date))
//  *       assert.deepStrictEqual(date, validate(date.toISOString()))
//  *       assert.deepStrictEqual(date, validate(date.getTime()))
//  *     })
//  *   })
//  */

// /*
//  *   describe('binary', () => {
//  *     const validate = decoder.decode(resolveSchema(Buffer))
//  */

// /*
//  *     it('should failed with invalid array buffer value', () => {
//  *       assert.throws(() => validate({}))
//  *       assert.throws(() => validate(false))
//  *       assert.throws(() => validate(100n))
//  *     })
//  */

// /*
//  *     it('should success with buffer value', () => {
//  *       const buffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8])
//  */

// /*
//  *       assert.deepStrictEqual(buffer, validate(buffer))
//  *     })
//  *   })
//  * })
//  */

// /*
//  * describe('validate enum', () => {
//  *   enum Color {
//  *     Red = 'Red',
//  *     Green = 'Green',
//  *     Blue = 'Blue',
//  *   }
//  */

// /*
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(Enum(Color))
//  */

// /*
//  *   it('should failed with invalid enum value', () => {
//  *     assert.throws(() => validate('red'))
//  *     assert.throws(() => validate(1))
//  *     assert.throws(() => validate({}))
//  *   })
//  */

// /*
//  *   it('should success with enum & string value', () => {
//  *     assert.strictEqual(Color.Red, validate(Color.Red))
//  *     assert.strictEqual(Color.Red, validate('Red'))
//  *     assert.strictEqual(Color.Green, validate(Color.Green))
//  *   })
//  * })
//  */

// /*
//  * describe('validate optional', () => {
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(Optional(String))
//  */

// /*
//  *   it('should failed with non-string or undefined value', () => {
//  *     assert.throws(() => validate(0))
//  *     assert.throws(() => validate({}))
//  *     assert.throws(() => validate(false))
//  *     assert.throws(() => validate(100n))
//  *     assert.throws(() => validate(null))
//  *   })
//  */

// /*
//  *   it('should success with string or undefined value', () => {
//  *     assert.strictEqual('foo', validate('foo'))
//  *     assert.strictEqual(undefined, validate(undefined))
//  *   })
//  * })
//  */

// /*
//  * describe('validate nullable', () => {
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(Nullable(String))
//  */

// /*
//  *   it('should failed with non-string or null value', () => {
//  *     assert.throws(() => validate(0))
//  *     assert.throws(() => validate({}))
//  *     assert.throws(() => validate(false))
//  *     assert.throws(() => validate(100n))
//  *     assert.throws(() => validate(undefined))
//  *   })
//  */

// /*
//  *   it('should success with string or null value', () => {
//  *     assert.strictEqual('foo', validate('foo'))
//  *     assert.strictEqual(null, validate(null))
//  *   })
//  * })
//  */

// /*
//  * describe('validate list', () => {
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(List(String))
//  */

// /*
//  *   it('should failed with non string array value', () => {
//  *     assert.throws(() => validate(0))
//  *     assert.throws(() => validate({}))
//  *     assert.throws(() => validate(false))
//  *     assert.throws(() => validate(100n))
//  *     assert.throws(() => validate(undefined))
//  *     assert.throws(() => validate([10]))
//  *   })
//  */

// /*
//  *   it('should success with string array value', () => {
//  *     assert.deepStrictEqual(['foo'], validate(['foo']))
//  *     assert.deepStrictEqual([], validate([]))
//  *   })
//  * })
//  */

// /*
//  * describe('validate dictionary', () => {
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(Dictionary(String))
//  */

// /*
//  *   it('should failed with non string dictionaary value', () => {
//  *     assert.throws(() => validate(0))
//  *     assert.throws(() => validate(false))
//  *     assert.throws(() => validate(100n))
//  *     assert.throws(() => validate(undefined))
//  *     assert.throws(() => validate([10]))
//  *     assert.throws(() => validate(['foo']))
//  *     assert.throws(() => validate({ foo: 10 }))
//  *   })
//  */

// /*
//  *   it('should success with string dictionary value', () => {
//  *     assert.deepStrictEqual({}, validate({}))
//  *     assert.deepStrictEqual({ foo: 'foo' }, validate({ foo: 'foo' }))
//  *   })
//  * })
//  */

// /*
//  * describe('validate tuple', () => {
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(Tuple(String, Number))
//  */

// /*
//  *   it('should failed with invalid tuple value', () => {
//  *     assert.throws(() => validate(0))
//  *     assert.throws(() => validate({}))
//  *     assert.throws(() => validate(false))
//  *     assert.throws(() => validate(100n))
//  *     assert.throws(() => validate(undefined))
//  *     assert.throws(() => validate([10]))
//  *     assert.throws(() => validate([]))
//  *   })
//  */

// /*
//  *   it('should success with correct tuple value', () => {
//  *     assert.deepStrictEqual(['foo', 10], validate(['foo', 10]))
//  *   })
//  * })
//  */

// /*
//  * describe('validate object', () => {
//  *   class A {
//  *     @Property(String)
//  *     public readonly foo!: string
//  */

// /*
//  *     @Property(Number)
//  *     public readonly bar!: number
//  *   }
//  */

// /*
//  *   const decoder = new JoiDecoder()
//  *   const validate = decoder.decode(A)
//  */

// /*
//  *   it('should failed with invalid object value', () => {
//  *     assert.throws(() => validate(0))
//  *     assert.throws(() => validate({}))
//  *     assert.throws(() => validate(false))
//  *     assert.throws(() => validate(100n))
//  *     assert.throws(() => validate(undefined))
//  *     assert.throws(() => validate([10]))
//  *     assert.throws(() => validate([]))
//  *   })
//  */

// /*
//  *   it('should success with correct object value', () => {
//  *     assert.deepStrictEqual(
//  *       {
//  *         foo: 'foo',
//  *         bar: 10,
//  *       },
//  *       validate({ foo: 'foo', bar: 10 }),
//  *     )
//  *   })
//  * })
//  */

// /*
//  * describe('validate TaggedUnion', () => {
//  *   const decoder: IDecoder<unknown> = new JoiDecoder()
//  */

// /*
//  *   const unionSchema = TaggedUnion('kind', {
//  *     foo: String,
//  *     bar: Number,
//  *   })
//  *   const validate = decoder.decode(unionSchema)
//  */

// /*
//  *   assert.throws(() => validate({}))
//  *   assert.throws(() => validate({ foo: 'string', bar: 0 }))
//  *   assert.throws(() => validate({ kind: 'foo', bar: 0 }))
//  *   assert.throws(() => validate({ kind: 'foo', foo: 0 }))
//  *   assert.throws(() => validate({ kind: 'bar', bar: 'bar' }))
//  */

// /*
//  *   expect(validate({ kind: 'foo', foo: 'str' })).toStrictEqual({
//  *     kind: 'foo',
//  *     foo: 'str',
//  *   })
//  *   expect(validate({ kind: 'bar', bar: 0 })).toStrictEqual({
//  *     kind: 'bar',
//  *     bar: 0,
//  *   })
//  *   expect(validate({ kind: 'bar', bar: '0' })).toStrictEqual({
//  *     kind: 'bar',
//  *     bar: 0,
//  *   })
//  * })
//  */
