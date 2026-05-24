interface HomeTitleProps {
  title: string
  rightAction?: React.ReactNode
}

const HomeTitle = ({ title, rightAction }: HomeTitleProps) => {
  return (
    <div className="px-[1.25rem] tab:px-[6.25rem]">
      <div className="flex items-center justify-center py-[0.75rem] tab:justify-between tab:pt-[2.969rem] tab:pb-[3.219rem]">
        <div className="hidden flex-1 tab:block" />
        <h1 className="text-sm leading-[1.5] font-semibold text-text-primary tab:text-xl tab:leading-[1.375rem] tab:font-bold">
          {title}
        </h1>
        {rightAction ? (
          <div className="flex flex-1 justify-end">{rightAction}</div>
        ) : (
          <div className="hidden flex-1 tab:block" />
        )}
      </div>
    </div>
  )
}

export { HomeTitle }
