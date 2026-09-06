/**
 * 페이지 셸의 반응형 최대 너비. 내부 여백은 각 영역의 디자인에 맞게 별도로 지정한다.
 * pc 디자인 기준이 1440이라 그 이상에서는 좌우 여백만 늘어나도록 가둔다.
 */
const PAGE_WIDTH_CLASS = 'mx-auto w-full max-w-[90rem]'

/**
 * breakpoint 경계에서 실제 콘텐츠 폭이 역으로 줄지 않는 반응형 페이지 셸.
 * - mobile: outer 704px → 16px gutter 화면의 content 672px
 * - tablet: outer 1376px → 48px gutter 화면의 content 1280px
 * - PC: outer 1440px → 80px gutter 화면의 content 1280px
 */
const RESPONSIVE_SHELL_CLASS =
  'mx-auto w-full max-w-[44rem] tab:max-w-[86rem] pc:max-w-[90rem]'

export { PAGE_WIDTH_CLASS, RESPONSIVE_SHELL_CLASS }
