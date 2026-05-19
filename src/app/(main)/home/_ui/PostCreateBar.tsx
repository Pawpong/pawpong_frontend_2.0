const PostCreateBar = () => {
  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-base font-medium leading-[1.375rem] text-[#5d5d5d]">
        게시글을 작성해보세요
      </p>
      <button
        type="button"
        className="flex h-12 w-[7.125rem] items-center justify-center rounded-full bg-[#d4d4d4] text-base font-semibold text-white"
      >
        작성
      </button>
    </div>
  )
}

export { PostCreateBar }
