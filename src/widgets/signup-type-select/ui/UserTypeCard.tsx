'use client'

interface UserTypeCardProps {
  label: string
  onClick: () => void
}

const UserTypeCard = ({ label, onClick }: UserTypeCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center bg-[#d9d9d9] transition-colors hover:bg-[#cecece] h-[13.8125rem] w-[14.9375rem] rounded-[0.5625rem] tab:h-[17.38rem] tab:w-[18.765rem] tab:rounded-[0.715rem]"
    >
      <span className="text-[1.4375rem] font-bold text-black tab:text-[1.787rem]">
        {label}
      </span>
    </button>
  )
}

export { UserTypeCard }
