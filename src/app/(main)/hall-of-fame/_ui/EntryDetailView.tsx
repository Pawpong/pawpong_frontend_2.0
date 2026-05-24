import type { ContestEntry, HomeUserType } from '@/shared/types'
import { EntryHeader } from './EntryHeader'
import { EntryImage } from './EntryImage'
import { EntryDescription } from './EntryDescription'

interface EntryDetailViewProps {
  entry: ContestEntry
  userType: HomeUserType
  onClose: () => void
  headerClassName?: string
  imageClassName?: string
}

const EntryDetailView = ({
  entry,
  userType,
  onClose,
  headerClassName,
  imageClassName,
}: EntryDetailViewProps) => (
  <>
    <EntryHeader
      entry={entry}
      onClose={onClose}
      userType={userType}
      className={headerClassName}
    />
    <EntryImage entry={entry} className={imageClassName} />
    <EntryDescription entry={entry} />
  </>
)

export { EntryDetailView }
