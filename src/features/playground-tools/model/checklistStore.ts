import {
  blankChecklist,
  changeChecklist,
  parseChecklist,
  type ChecklistAction,
  type ChecklistState,
} from './checklist'

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Snapshot = { data: ChecklistState; saved: boolean }
export const checklistStorageKey = (owner: string) =>
  `pawpong:outing:v1:${encodeURIComponent(owner)}`

/** Each account and the guest use separate device data; credentials are never persisted. */
export function createChecklistStore(storage: StoragePort | null, owner: string) {
  const key = checklistStorageKey(owner)
  let snapshot: Snapshot = { data: blankChecklist(), saved: !!storage }
  const listeners = new Set<() => void>()
  let raw: string | null = null
  const notify = () => listeners.forEach((listener) => listener())
  const reload = () => {
    // A storage event must not discard edits that failed to persist in this tab.
    if (!storage || !snapshot.saved) return
    try {
      const value = storage.getItem(key)
      if (value !== raw) {
        raw = value
        snapshot = { data: parseChecklist(value), saved: true }
        notify()
      }
    } catch {
      snapshot = { ...snapshot, saved: false }
      notify()
    }
  }
  reload()
  return {
    key,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    reload,
    dispatch(action: ChecklistAction) {
      // Merge against the latest other-tab value without overwriting an unsaved in-memory change.
      if (snapshot.saved) reload()
      const data = changeChecklist(snapshot.data, action)
      let saved = false
      try {
        if (storage) {
          if (action.type === 'clear') {
            storage.removeItem(key)
            raw = null
          } else {
            raw = JSON.stringify(data)
            storage.setItem(key, raw)
          }
          saved = true
        }
      } catch {
        /* Quota/private mode: edits remain useful until the page closes. */
      }
      snapshot = { data, saved }
      notify()
    },
  }
}
