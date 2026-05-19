const PostCreateBar = () => {
  return (
    <div className="flex items-center justify-between py-[0.388rem]">
      <p className="text-sm font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-base">
        게시글을 작성해보세요
      </p>
      <button
        type="button"
        className="flex h-8 w-[4.4375rem] items-center justify-center rounded-full bg-[#d4d4d4] text-base font-semibold text-white tab:h-12 tab:w-[7.125rem]"
      >
        작성
      </button>
    </div>
  )
}

export { PostCreateBar }
