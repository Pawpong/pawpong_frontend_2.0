const fs = require('node:fs')
const ts = require('typescript')

function loadTypescript(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const result = {}
  new Function('exports', 'require', ...Object.keys(globals), code)(
    result,
    (name) => dependencies[name] ?? require(name),
    ...Object.values(globals),
  )
  return result
}

module.exports = { loadTypescript }
