import type { BreederUploadDocumentType } from '@/shared/types'
import type { DocumentsFormData } from './schema'

export const BREEDER_DOCUMENT_FIELDS = [
  { field: 'idDocument', label: '신분증 사본', uploadType: 'idCard' },
  {
    field: 'registrationCert',
    label: '동물생산업 등록증',
    uploadType: 'animalProductionLicense',
  },
] as const satisfies ReadonlyArray<{
  field: keyof Pick<DocumentsFormData, 'idDocument' | 'registrationCert'>
  label: string
  uploadType: BreederUploadDocumentType
}>

export const getSelectedBreederDocuments = (data: DocumentsFormData) =>
  BREEDER_DOCUMENT_FIELDS.flatMap(({ field, uploadType }) => {
    const file = data[field]
    return file ? [{ type: uploadType, file }] : []
  })

/**
 * 같은 파일 묶음인지 판별하는 키.
 * 가입 요청이 실패해 재시도할 때, 파일이 그대로면 업로드를 건너뛰기 위해 쓴다
 * (File 객체는 매번 새 참조라 내용 기준으로 비교해야 한다).
 */
export const getBreederDocumentsSignature = (
  documents: ReturnType<typeof getSelectedBreederDocuments>,
) =>
  documents
    .map(({ type, file }) => `${type}:${file.name}:${file.size}:${file.lastModified}`)
    .join('|')
