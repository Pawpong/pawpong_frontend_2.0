const ts = require('typescript')

const quietMethods = new Set(['log', 'info', 'debug'])

function transform(source, fileName, worker = false) {
  return ts.transpileModule(source, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      sourceMap: !worker,
    },
    transformers: {
      before: [
        (context) => {
          function visit(node) {
            if (
              ts.isPropertyAccessExpression(node) &&
              ts.isIdentifier(node.expression) &&
              node.expression.text === 'console' &&
              quietMethods.has(node.name.text)
            ) {
              // bind/apply와 별칭도 조용하게 만들며 인자 평가와 warn/error는 보존한다.
              return ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                undefined,
                ts.factory.createVoidZero(),
              )
            }
            if (
              !worker &&
              fileName.includes('heic-to') &&
              ts.isStringLiteral(node) &&
              node.text.startsWith('(()=>{') &&
              node.text.includes('console.log')
            ) {
              // heic-to/csp는 실행할 Worker 전체를 문자열로 포함하므로 별도로 파싱한다.
              return ts.factory.createStringLiteral(
                transform(node.text, 'heic-worker.js', true).outputText,
              )
            }
            return ts.visitEachChild(node, visit, context)
          }
          return (file) => ts.visitNode(file, visit)
        },
      ],
    },
  })
}

module.exports = function removeVendorConsole(source) {
  const result = transform(source, this.resourcePath)
  this.callback(null, result.outputText, JSON.parse(result.sourceMapText))
}
