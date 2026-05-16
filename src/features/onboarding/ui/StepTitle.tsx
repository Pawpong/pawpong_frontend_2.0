interface StepTitleProps {
  children: React.ReactNode
}

const StepTitle = ({ children }: StepTitleProps) => (
  <div className="mt-[4.375rem] flex w-full items-center justify-center px-[1.25rem] py-[0.625rem] tab:mt-0 tab:h-[7.8125rem] tab:px-[6.25rem]">
    <h1 className="text-center text-[1.25rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[2rem]">
      {children}
    </h1>
  </div>
)

export { StepTitle }
