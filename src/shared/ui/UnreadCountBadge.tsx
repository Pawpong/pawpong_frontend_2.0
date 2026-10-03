// 아이콘 우상단 안 읽음 숫자 — 알림 벨·채팅 nav 공용. 부모 요소가 relative 여야 한다.
const UnreadCountBadge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[0.625rem] leading-none font-semibold text-white">
      {count > 99 ? '99+' : count}
    </span>
  ) : null

export { UnreadCountBadge }
