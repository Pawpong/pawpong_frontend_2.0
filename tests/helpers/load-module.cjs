const fs = require('node:fs')
const ts = require('typescript')

exports.loadModule = function loadModule(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => {
    if (!(name in dependencies)) throw new Error(`등록되지 않은 테스트 의존성: ${name}`)
    return dependencies[name]
  })
  return output
}
