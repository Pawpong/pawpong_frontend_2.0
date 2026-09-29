// Compile-time regression checks: pnpm type-check must reject style escape hatches.
import { Button, buttonVariants } from '@/shared/ui/Button'
import { IconButton, iconButtonVariants } from '@/shared/ui/IconButton'
import { ToggleIconButton } from '@/shared/ui/ToggleIconButton'
import { Chip, chipVariants } from '@/shared/ui/Chip'
import { ActionSheetItem } from '@/shared/ui/ActionSheetItem'
import { FollowButton } from '@/shared/ui/FollowButton'
import { ApplicationChatButton } from '@/features/chat-entry'

const Icon = () => null
const overrides = { className: 'h-10 bg-red-500' }
const variantOverrides = { intent: 'primary' as const, ...overrides }

export const buttonContractFixtures = () => {
  // @ts-expect-error caller classes are forbidden, including object spreads
  const button = <Button {...overrides} />
  // @ts-expect-error inline styles must not bypass the component contract
  const styled = <Button style={{ height: 100 }} />
  // @ts-expect-error icon button classes belong on parent slots
  const icon = <IconButton aria-label="close" {...overrides} />
  // @ts-expect-error toggle classes belong on parent slots
  const toggle = <ToggleIconButton icon={Icon} {...overrides} />
  // @ts-expect-error chip appearance is owned by Chip
  const chip = <Chip {...overrides} />
  // @ts-expect-error sheet appearance is owned by ActionSheetItem
  const item = <ActionSheetItem {...overrides} />
  // @ts-expect-error wrapper must not forward arbitrary styles
  const follow = <FollowButton status="follow" className="w-full" />
  // @ts-expect-error chat wrapper uses width, not arbitrary classes
  const chat = <ApplicationChatButton counterpartUserId="fixture" className="flex-1" />
  // @ts-expect-error variant functions reject classes even in predeclared objects
  buttonVariants(variantOverrides)
  // @ts-expect-error tv's alternate `class` escape hatch is not public
  buttonVariants({ class: 'h-10' })
  // @ts-expect-error icon links follow the same contract
  iconButtonVariants({ tone: 'muted', ...overrides })
  // @ts-expect-error chip variants follow the same contract
  chipVariants({ selected: true, ...overrides })
  return [
    button,
    styled,
    icon,
    toggle,
    chip,
    item,
    follow,
    chat,
    <Button key="valid" width="fill" intent="kakao" disabled />,
    <IconButton key="edge" edge="end" aria-label="close" />,
  ]
}
