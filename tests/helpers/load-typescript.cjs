const fs = require('node:fs')
const ts = require('typescript')

function loadTypescript(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    // 확장자로 JSX 여부를 정한다 — .ts 의 제네릭 화살표 함수(<T>(...) =>)를 JSX 로 읽지 않게
    fileName: file,
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
