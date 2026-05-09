const Banner = () => {
  return (
    <section className="flex w-full flex-col items-center gap-[1.25rem] bg-[#d9d9d9] px-[1.25rem] py-[2.5rem] text-center text-black tab:px-[3rem] tab:py-[6.25rem] pc:px-[6.25rem]">
      <h1 className="text-[1.5rem] leading-[1.5] tab:text-[2.5rem] tab:font-bold">
        <span className="block">건강하고 사랑스러운</span>
        <span className="hidden tab:block">내 취향의 동물들을 찾고 계신가요?</span>
        <span className="block tab:hidden">내 취향의 동물들을</span>
        <span className="block tab:hidden">찾고 계신가요?</span>
      </h1>
      <p className="text-[1.25rem] font-semibold leading-[1.5] tab:text-[1.5rem]">
        <span className="hidden tab:inline">평생을 함께할 반려동물 포퐁에서 찾으세요!</span>
        <span className="block tab:hidden">평생을 함께할 반려동물</span>
        <span className="block tab:hidden">포퐁에서 찾으세요!</span>
      </p>
    </section>
  )
}

export { Banner }
