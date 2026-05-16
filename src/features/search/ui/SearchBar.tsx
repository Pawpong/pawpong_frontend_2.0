const SearchBar = () => {
  return (
    <div className="flex items-center gap-[0.25rem]">
      <div className="flex flex-1 items-center gap-[0.5rem] rounded-[0.5rem] border border-[#e5e5e5] bg-white p-[0.75rem] tab:rounded-full tab:border-[#a8a8a8] tab:px-[1.75rem] tab:py-[0.75rem]">
        <span className="flex-1 text-[0.875rem] text-[#171717] tab:font-semibold tab:text-[#a8a8a8]">
          <span className="tab:hidden">검색해서 원하는 동물 찾기</span>
          <span className="hidden tab:inline">검색해서 원하는 아이 찾기</span>
        </span>
      </div>
      <div className="flex size-[3rem] shrink-0 items-center justify-center rounded-[0.5rem] bg-[#3b3b3b] p-[0.5rem] tab:hidden">
        <svg className="size-[1rem]" viewBox="0 0 16 16" fill="none">
          <path
            d="M14.7556 16L9.15556 10.4C8.71111 10.7556 8.2 11.037 7.62222 11.2444C7.04444 11.4519 6.42963 11.5556 5.77778 11.5556C4.16296 11.5556 2.7963 10.9963 1.67778 9.87778C0.559259 8.75926 0 7.39259 0 5.77778C0 4.16296 0.559259 2.7963 1.67778 1.67778C2.7963 0.559259 4.16296 0 5.77778 0C7.39259 0 8.75926 0.559259 9.87778 1.67778C10.9963 2.7963 11.5556 4.16296 11.5556 5.77778C11.5556 6.42963 11.4519 7.04444 11.2444 7.62222C11.037 8.2 10.7556 8.71111 10.4 9.15556L16 14.7556L14.7556 16ZM5.77778 9.77778C6.88889 9.77778 7.83333 9.38889 8.61111 8.61111C9.38889 7.83333 9.77778 6.88889 9.77778 5.77778C9.77778 4.66667 9.38889 3.72222 8.61111 2.94444C7.83333 2.16667 6.88889 1.77778 5.77778 1.77778C4.66667 1.77778 3.72222 2.16667 2.94444 2.94444C2.16667 3.72222 1.77778 4.66667 1.77778 5.77778C1.77778 6.88889 2.16667 7.83333 2.94444 8.61111C3.72222 9.38889 4.66667 9.77778 5.77778 9.77778Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="hidden size-[2rem] rounded-full bg-[#d9d9d9] tab:block" />
    </div>
  )
}

export { SearchBar }
