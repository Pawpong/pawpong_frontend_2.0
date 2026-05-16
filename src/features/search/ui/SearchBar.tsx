const SearchBar = () => {
  return (
    <div className="flex items-center gap-[0.25rem]">
      <div className="flex flex-1 items-center gap-[0.5rem] rounded-[0.5rem] border border-[#e5e5e5] bg-white p-[0.75rem] tab:rounded-full tab:border-[#a8a8a8] tab:px-[1.75rem] tab:py-[0.75rem]">
        <span className="flex-1 text-[0.875rem] text-[#171717] tab:font-semibold tab:text-[#a8a8a8]">
          <span className="tab:hidden">검색해서 원하는 동물 찾기</span>
          <span className="hidden tab:inline">검색해서 원하는 아이 찾기</span>
        </span>
      </div>
      <div className="flex size-[3rem] shrink-0 items-center justify-center rounded-[0.5rem] bg-[#3b3b3b] tab:hidden">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M11.4 12L6.8 7.4C6.4667 7.66667 6.0917 7.88333 5.675 8.05C5.25833 8.21667 4.8 8.3 4.3 8.3C3.1 8.3 2.08333 7.88333 1.25 7.05C0.416667 6.21667 0 5.2 0 4C0 2.8 0.416667 1.78333 1.25 0.95C2.08333 0.116667 3.1 0 4.3 0C5.5 0 6.51667 0.116667 7.35 0.95C8.18333 1.78333 8.6 2.8 8.6 4C8.6 4.5 8.51667 4.95833 8.35 5.375C8.18333 5.79167 7.96667 6.16667 7.7 6.5L12.3 11.1L11.4 12ZM4.3 7C5.13333 7 5.83333 6.71667 6.4 6.15C6.96667 5.58333 7.25 4.88333 7.25 4.05C7.25 3.21667 6.96667 2.51667 6.4 1.95C5.83333 1.38333 5.13333 1.1 4.3 1.1C3.46667 1.1 2.76667 1.38333 2.2 1.95C1.63333 2.51667 1.35 3.21667 1.35 4.05C1.35 4.88333 1.63333 5.58333 2.2 6.15C2.76667 6.71667 3.46667 7 4.3 7Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="hidden size-[2rem] rounded-full bg-[#d9d9d9] tab:block" />
    </div>
  )
}

export { SearchBar }
