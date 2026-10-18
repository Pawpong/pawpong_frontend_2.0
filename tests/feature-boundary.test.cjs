const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const source = (file) => fs.readFileSync(file, 'utf8')

test('AI 사진 기능은 반려동물 기능을 직접 가져오지 않고 화면 조립 계층이 캐릭터 이어가기 버튼을 넣음', () => {
  for (const file of [
    'src/features/ai-image/ui/AiFilterStudio.tsx',
    'src/features/ai-image/ui/AiPhotoArchive.tsx',
  ]) {
    assert.doesNotMatch(source(file), /features\/playground-pet/, file)
    assert.match(source(file), /renderResultAction\?\.\(/, file)
  }
  assert.match(source('src/features/playground-pet/index.ts'), /export \{ PetResultLink \}/)
  for (const file of [
    'src/app/(main)/ai-filter/_ui/AiFilterContent.tsx',
    'src/app/(main)/home/_ui/MyHomeContent.tsx',
  ]) {
    assert.match(source(file), /import \{ PetResultLink \} from '@\/features\/playground-pet'/, file)
    assert.match(source(file), /renderResultAction=\{\(jobId[^)]*\) =>/, file)
  }
})
