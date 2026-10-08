import {
  PET_ACTION_ICONS,
  PET_ACTION_LABELS,
  formatPetWait,
  remainingSeconds,
  type PetTab,
  type PetView,
} from '@/entities/playground-pet'
import { PET_SLOT_LABELS, PET_SLOTS } from '@/entities/playground-pet/model/room'
import { PetGlyph } from './PetGlyph'
import styles from './PetRoom.module.css'

interface PetRoomSummaryProps {
  pet: NonNullable<PetView['pet']>
  view: PetView
  daysTogether: number | null
  now: number
  onOpenTab: (tab: PetTab) => void
}

/** 방 탭: 함께한 날, 오늘의 돌봄 진행, 방 소품 요약과 다른 탭으로 가는 버튼. */
export function PetRoomSummary({ pet, view, daysTogether, now, onOpenTab }: PetRoomSummaryProps) {
  const { game } = view
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>오늘도 함께하는 작은 일상</p>
          <h2>우리 아이의 방</h2>
        </div>
        <PetGlyph kind="paw" />
      </div>
      <p className={styles.hint}>
        {daysTogether !== null && `${pet.name}와 함께한 지 ${daysTogether}일째예요. `}
        {view.week.daysTogether > 0 && `이번 주에는 ${view.week.daysTogether}일 만났어요. `}
        돌봄으로 자라고, 별사탕으로 방을 꾸며요.
      </p>
      <div className={styles.questProgress}>
        <span>
          오늘의 돌봄 {view.daily.quests.filter((quest) => quest.completed).length} /{' '}
          {view.daily.quests.length}
        </span>
        <progress
          value={view.daily.quests.filter((quest) => quest.completed).length}
          max={Math.max(1, view.daily.quests.length)}
          aria-label={`오늘의 돌봄 ${view.daily.quests.filter((quest) => quest.completed).length} / ${view.daily.quests.length}`}
        />
      </div>
      <div className={styles.questList}>
        {view.daily.quests.map((quest) => (
          <div key={quest.id}>
            <span>
              <PetGlyph kind={PET_ACTION_ICONS[quest.id]} /> {PET_ACTION_LABELS[quest.id]}
            </span>
            <strong>{quest.completed ? '완료 ✓' : `+${quest.rewardXp} EXP`}</strong>
          </div>
        ))}
      </div>
      <p className={styles.finePrint}>
        오늘 성장 EXP {view.daily.xp} / {view.daily.maxXp} · 친밀도 {pet.stats.affinity}
      </p>
      {game ? (
        <>
          <div className={styles.roomInventory}>
            {PET_SLOTS.map((slot) => (
              <div key={slot}>
                <span>{PET_SLOT_LABELS[slot]}</span>
                <strong>
                  {game.catalog.find((item) => item.id === game.room[slot])?.name ?? '비어 있음'}
                </strong>
              </div>
            ))}
          </div>
          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} onClick={() => onOpenTab('decorate')}>
              우리 아이 방 꾸미기
            </button>
            <button className={styles.smallButton} onClick={() => onOpenTab('games')}>
              미니게임 하기
            </button>
            <button className={styles.smallButton} onClick={() => onOpenTab('shop')}>
              별사탕 상점
            </button>
          </div>
        </>
      ) : (
        <p role="status" className={styles.hint}>
          새 게임 기능을 준비하고 있어요. 돌봄은 계속할 수 있어요.
        </p>
      )}
      {pet.restEndsAt && (
        <p className={styles.hint}>휴식 {formatPetWait(remainingSeconds(pet.restEndsAt, now))}</p>
      )}
    </section>
  )
}
