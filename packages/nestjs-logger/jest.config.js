const path = require('path')
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const ts = require('typescript')

const compilerOptions = ts.readJsonConfigFile(
  path.resolve(__dirname, './tsconfig.build.json'),
  ts.sys.readFile,
)

const params = ts.parseJsonSourceFileConfigFileContent(
  compilerOptions,
  ts.sys,
  __dirname,
)

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: pathsToModuleNameMapper(
    Object.keys(params.options.paths).reduce((prev, key) => {
      return {
        ...prev,
        [key]: params.options.paths[key].map(value =>
          path.resolve(__dirname, '..', '..', value),
        ),
      }
    }, {}),
  ),
}
