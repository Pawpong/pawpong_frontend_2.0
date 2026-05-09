const POPULAR_KEYWORDS = ['강아지', '고양이', '비숑', '개코 도마뱀', '레오파드']

const PopularKeywords = () => {
  return (
    <div className="mt-[1.125rem] flex items-start gap-[1.0625rem]">
      <span className="shrink-0 text-[0.875rem] font-semibold text-[#a8a8a8]">
        인기 검색어
      </span>
      <div className="flex flex-wrap gap-[0.625rem] overflow-hidden tab:flex-nowrap">
        {POPULAR_KEYWORDS.map((keyword) => (
          <span
            key={keyword}
            className="shrink-0 rounded-full border border-[#a8a8a8] px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold text-[#a8a8a8]"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  )
}

export { PopularKeywords }
