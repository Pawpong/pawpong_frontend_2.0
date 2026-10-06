export const COMMUNITY_TOPIC_GROUPS = [
  { title: '밖에서 함께', keys: ['walk', 'park', 'travel', 'cafe'] },
  {
    title: '건강과 진료',
    keys: [
      'clinic',
      'emergency',
      'vaccination',
      'checkup',
      'dental',
      'skin',
      'rehabilitation',
      'senior',
      'nutrition',
      'allergy',
    ],
  },
  {
    title: '생활과 돌봄',
    keys: [
      'daily',
      'training',
      'socialization',
      'grooming',
      'supplies',
      'insurance',
      'habitat',
      'reptile-care',
    ],
  },
  { title: '만남과 기억', keys: ['adoption', 'rescue', 'lost', 'memorial'] },
  { title: '질문과 창작', keys: ['question', 'ai-photo'] },
] as const

export function normalizeCommunityTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.normalize('NFC').trim().replace(/^#/, '').toLowerCase())
        .filter((tag) => /^[\p{L}\p{N}][\p{L}\p{N} _-]{0,19}$/u.test(tag)),
    ),
  ].slice(0, 5)
}
