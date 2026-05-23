interface AddRowButtonProps {
  label: string
  onClick?: () => void
}

const AddRowButton = ({ label, onClick }: AddRowButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="mx-auto h-7 rounded-[0.375rem] bg-[#a8a8a8] px-[0.625rem] text-sm font-medium text-white tab:h-auto tab:w-[28.75rem] tab:rounded-full tab:p-[0.625rem] tab:text-sm"
  >
    {label}
  </button>
)

export { AddRowButton }
