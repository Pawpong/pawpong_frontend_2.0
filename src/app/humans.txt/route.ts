import { PAWPONG_MAKERS } from '@/shared/config/makers'

export const dynamic = 'force-static'

export function GET() {
  const team = PAWPONG_MAKERS.map(
    ({ name, github, site }) =>
      `Name: ${name}\nGitHub: https://github.com/${github}${site ? `\nBlog: ${site}` : ''}`,
  ).join('\n\n')

  return new Response(`/* TEAM */\n\n${team}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
