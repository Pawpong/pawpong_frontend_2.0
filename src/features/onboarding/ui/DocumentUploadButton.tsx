import { DocumentFilePicker } from '@/shared/ui'

interface DocumentUploadButtonProps {
  label: string
  /** 파일 선택 시 호출 (선택한 File 전달) */
  onFileSelect?: (file: File) => void
  /** 이미 선택된 파일명 — 있으면 라벨 대신 표시 */
  selectedFileName?: string
  /** 허용 파일 형식 (기본: 이미지·PDF) */
  accept?: string
  className?: string
}

/**
 * 서류 업로드 버튼 (Figma 3134-343413)
 * 클릭 시 숨은 파일 input 을 열어 파일을 선택하고, 선택한 File 을 onFileSelect 로 상위 폼에 전달한다.
 */
const DocumentUploadButton = ({
  label,
  onFileSelect,
  selectedFileName,
  accept,
  className,
}: DocumentUploadButtonProps) => (
  <DocumentFilePicker
    label={label}
    selectedFileName={selectedFileName}
    accept={accept}
    onFileSelect={(file) => onFileSelect?.(file)}
    className={className}
  />
)

export { DocumentUploadButton }
