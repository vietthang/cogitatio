const { pathsToModuleNameMapper } = require('ts-jest/utils')
const ts = require('typescript')
const path = require('path')

const compilerOptions = ts.readJsonConfigFile(
  path.resolve(__dirname, './tsconfig.json'),
  ts.sys.readFile,
)

const params = ts.parseJsonSourceFileConfigFileContent(
  compilerOptions,
  ts.sys,
  __dirname,
)

module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  moduleNameMapper: pathsToModuleNameMapper({
    '@cogitatio/tc39-temporal': [
      path.resolve(__dirname, 'packages', 'tc39-temporal'),
    ],
    ...Object.keys(params.options.paths).reduce((prev, key) => {
      return {
        ...prev,
        [key]: params.options.paths[key].map(value =>
          path.resolve(__dirname, value),
        ),
      }
    }, {}),
  }),
}
