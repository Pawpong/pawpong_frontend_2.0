import Image from 'next/image'

interface HealthRecordEmptyProps {
  /**
   * 브리더가 입력한 미완료 사유.
   * 작성 폼이 미완료 상태에서 사유를 필수로 받으므로(프론트 schema·백엔드 validator 양쪽) 보통 값이 있다.
   * 레거시 글처럼 비어 있을 때만 fallback 문구를 쓴다.
   */
  reason?: string
  /** 사유가 없을 때 대신 보여줄 문구 */
  fallback: string
}

/**
 * 접종·유전병 기록이 없을 때의 빈 상태 (Figma 4553:931740 `emty`).
 *
 * 시안은 일러스트만 두지만 그대로 따르면 브리더가 필수로 입력한 미완료 사유가
 * 어디에도 안 보인다. 그래서 일러스트 아래에 사유를 함께 노출한다.
 *
 * 사유는 neutral-700 을 쓴다. 이전에 쓰던 #a4a4a4 는 카드 배경(point-50 #fffff1)
 * 위에서 대비가 2.5:1 이라 글자가 안 읽혔다 (WCAG AA 기준 4.5:1).
 */
const HealthRecordEmpty = ({ reason, fallback }: HealthRecordEmptyProps) => (
  <div className="flex flex-col items-center gap-[0.5rem] py-[0.5rem]">
    <Image
      src="/images/empty/health-record-empty.svg"
      alt=""
      width={134}
      height={119}
      // 장식용이라 보조기기에서 읽을 필요가 없다 — 의미는 아래 문구가 전달한다
      aria-hidden
      className="h-auto w-[8.375rem]"
    />
    <p className="text-center text-[0.875rem] leading-[1.375rem] font-medium text-neutral-700">
      {reason || fallback}
    </p>
  </div>
)

export { HealthRecordEmpty }
