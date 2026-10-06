export const OUTING_TEMPLATES = [
  {
    id: 'walk',
    title: '동네 산책',
    caption: '가볍게 한 바퀴, 빠짐없이 챙겨요.',
    items: [
      '하네스와 리드줄',
      '배변 봉투',
      '물과 휴대용 물그릇',
      '연락처가 있는 인식표',
      '돌아와서 닦을 수건',
    ],
    nextLabel: '산책 기록 남기기',
    nextUrl: '/community/write?experience=walk',
  },
  {
    id: 'cafe',
    title: '카페 나들이',
    caption: '함께 머무를 곳의 이용 규칙부터 확인해요.',
    items: [
      '반려동물 동반 규칙 확인',
      '리드줄 또는 이동장',
      '우리 아이가 쉴 매트',
      '물그릇과 배변 봉투',
      '조용히 놀 장난감',
    ],
    nextLabel: '오늘 이야기 남기기',
    nextUrl: '/community/write?experience=daily',
  },
  {
    id: 'travel',
    title: '함께 여행',
    caption: '낯선 곳에서도 익숙하고 편안하게.',
    items: [
      '숙소와 이동 수단 동반 규칙 확인',
      '이동장 또는 차량용 안전장치',
      '평소 먹는 사료와 물그릇',
      '배변 용품과 여분 수건',
      '연락처가 있는 인식표',
      '익숙한 담요와 장난감',
    ],
    nextLabel: '여행 이야기 남기기',
    nextUrl: '/community/write?experience=daily',
  },
  {
    id: 'clinic',
    title: '병원 방문',
    caption: '진료 때 전달할 이야기와 준비물을 모아요.',
    items: [
      '병원 위치와 진료 시간 확인',
      '예약 내용 확인',
      '궁금한 점과 관찰한 모습 메모',
      '필요한 이전 진료 기록',
      '복용 중인 약 이름 메모',
      '이동장 또는 하네스와 리드줄',
    ],
    nextLabel: '병원 방문 기록 남기기',
    nextUrl: '/community/write?experience=clinic',
  },
] as const

export type OutingType = (typeof OUTING_TEMPLATES)[number]['id']
export type ChecklistItem = { id: string; label: string; custom?: true }
export type OutingList = { checked: string[]; custom: ChecklistItem[] }
export type ChecklistState = {
  version: 1
  selected: OutingType
  lists: Record<OutingType, OutingList>
}
export type ChecklistAction =
  | { type: 'select'; outing: OutingType }
  | { type: 'toggle'; outing: OutingType; id: string }
  | { type: 'add'; outing: OutingType; id: string; label: string }
  | { type: 'remove'; outing: OutingType; id: string }
  | { type: 'uncheck'; outing: OutingType }
  | { type: 'clear' }

export const MAX_CUSTOM_ITEMS = 12
export const MAX_ITEM_LENGTH = 50
export function createChecklistItemId(random: Pick<Crypto, 'getRandomValues'> = crypto) {
  // getRandomValues is also available in webviews without randomUUID.
  const bytes = random.getRandomValues(new Uint8Array(16))
  return `custom-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}
export function isOutingType(value: unknown): value is OutingType {
  return OUTING_TEMPLATES.some((t) => t.id === value)
}
export function blankChecklist(): ChecklistState {
  return {
    version: 1,
    selected: 'walk',
    lists: {
      walk: { checked: [], custom: [] },
      cafe: { checked: [], custom: [] },
      travel: { checked: [], custom: [] },
      clinic: { checked: [], custom: [] },
    },
  }
}
export function checklistItems(state: ChecklistState, outing: OutingType): ChecklistItem[] {
  const template = OUTING_TEMPLATES.find((t) => t.id === outing)!
  return [
    ...template.items.map((label, i) => ({ id: `${outing}-${i}`, label })),
    ...state.lists[outing].custom,
  ]
}
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
export function normalizeItemLabel(label: string) {
  return label
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Local storage is user-editable. Unknown versions and malformed items never become UI state. */
export function parseChecklist(raw: string | null): ChecklistState {
  const result = blankChecklist()
  if (!raw || raw.length > 30_000) return result
  try {
    const input: unknown = JSON.parse(raw)
    if (!record(input) || input.version !== 1 || !record(input.lists)) return result
    if (isOutingType(input.selected)) result.selected = input.selected
    for (const { id } of OUTING_TEMPLATES) {
      const list = input.lists[id]
      if (!record(list)) continue
      const ids = new Set<string>()
      const labels = new Set(checklistItems(result, id).map((i) => i.label))
      if (Array.isArray(list.custom)) {
        for (const item of list.custom.slice(0, MAX_CUSTOM_ITEMS)) {
          if (
            !record(item) ||
            typeof item.id !== 'string' ||
            !/^custom-[a-zA-Z0-9-]{1,70}$/.test(item.id) ||
            typeof item.label !== 'string'
          )
            continue
          const label = normalizeItemLabel(item.label)
          if (!label || label.length > MAX_ITEM_LENGTH || ids.has(item.id) || labels.has(label))
            continue
          result.lists[id].custom.push({ id: item.id, label, custom: true })
          ids.add(item.id)
          labels.add(label)
        }
      }
      const available = new Set(checklistItems(result, id).map((i) => i.id))
      if (Array.isArray(list.checked))
        result.lists[id].checked = [
          ...new Set(
            list.checked.filter((v): v is string => typeof v === 'string' && available.has(v)),
          ),
        ]
    }
  } catch {
    /* Corrupt or outdated device data starts with a usable list. */
  }
  return result
}

export function changeChecklist(state: ChecklistState, action: ChecklistAction): ChecklistState {
  if (action.type === 'clear') return blankChecklist()
  if (!isOutingType(action.outing)) return state
  if (action.type === 'select') return { ...state, selected: action.outing }
  const list = state.lists[action.outing]
  let next: OutingList = list
  if (action.type === 'toggle') {
    if (!checklistItems(state, action.outing).some((i) => i.id === action.id)) return state
    next = {
      ...list,
      checked: list.checked.includes(action.id)
        ? list.checked.filter((id) => id !== action.id)
        : [...list.checked, action.id],
    }
  } else if (action.type === 'add') {
    const label = normalizeItemLabel(action.label)
    if (
      !label ||
      label.length > MAX_ITEM_LENGTH ||
      list.custom.length >= MAX_CUSTOM_ITEMS ||
      !/^custom-[a-zA-Z0-9-]{1,70}$/.test(action.id) ||
      checklistItems(state, action.outing).some((i) => i.id === action.id || i.label === label)
    )
      return state
    next = { ...list, custom: [...list.custom, { id: action.id, label, custom: true }] }
  } else if (action.type === 'remove') {
    if (!list.custom.some((i) => i.id === action.id)) return state
    next = {
      checked: list.checked.filter((id) => id !== action.id),
      custom: list.custom.filter((i) => i.id !== action.id),
    }
  } else if (action.type === 'uncheck') next = { ...list, checked: [] }
  return { ...state, lists: { ...state.lists, [action.outing]: next } }
}

export function checklistText(state: ChecklistState) {
  const template = OUTING_TEMPLATES.find((t) => t.id === state.selected)!
  return [
    `포퐁 · ${template.title} 준비함`,
    ...checklistItems(state, state.selected).map(
      (i) => `${state.lists[state.selected].checked.includes(i.id) ? '✓' : '□'} ${i.label}`,
    ),
  ].join('\n')
}
