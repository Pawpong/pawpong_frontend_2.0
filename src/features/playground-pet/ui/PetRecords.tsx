import type { PetView } from '@/entities/playground-pet'
import { PetGlyph } from './PetGlyph'
import { PetImage } from './PetImage'
import styles from './PetRoom.module.css'

const RECORD_LABELS = {
  adopted: '처음 만난 날',
  first_meal: '첫 식사를 함께했어요',
  level_up: '우리 아이가 자랐어요',
  unlock: '새로운 추억이 열렸어요',
  seven_days: '일곱 날을 함께했어요',
}
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))

interface PetRecordsProps {
  pet: NonNullable<PetView['pet']>
  game: PetView['game']
  records: PetView['records']
}

/** 기록 탭: 업적 진행과 함께한 기록, 처음 함께한 그림. */
export function PetRecords({ pet, game, records }: PetRecordsProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>같이 쌓은 작은 추억</p>
          <h2>성장 기록</h2>
        </div>
        <PetGlyph kind="star" />
      </div>
      {game && (
        <ul className={styles.achievements}>
          {game.achievements.map((achievement) => (
            <li
              key={achievement.id}
              className={achievement.completed ? styles.achievementDone : undefined}
            >
              <PetGlyph kind={achievement.completed ? 'star' : 'paw'} />
              <div>
                <strong>{achievement.label}</strong>
                <progress
                  max={achievement.target}
                  value={achievement.progress}
                  aria-label={`${achievement.label} 진행`}
                />
              </div>
              <span>
                {achievement.completed ? '완료' : `${achievement.progress}/${achievement.target}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <ul className={styles.records}>
        {/* 레벨이 오를 때 서버가 남기는 unlock 기록은 실제로 열리는 콘텐츠가 없어 보여주지 않는다. */}
        {records
          .filter((record) => record.type !== 'unlock')
          .map((record) => (
            <li key={record.id}>
              <time dateTime={record.at}>{formatDate(record.at)}</time>
              <span>
                {RECORD_LABELS[record.type]}
                {record.level ? ` · Lv.${record.level}` : ''}
              </span>
            </li>
          ))}
      </ul>
      <details className={styles.hint}>
        <summary>처음 함께한 그림 보기</summary>
        <div className={styles.portrait}>
          <PetImage src={pet.imageUrl} alt={`${pet.name}의 처음 함께한 그림`} />
        </div>
      </details>
    </section>
  )
}
