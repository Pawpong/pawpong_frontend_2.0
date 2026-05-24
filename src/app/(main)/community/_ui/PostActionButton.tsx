interface PostActionButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count?: number
}

const PostActionButton = ({ icon: Icon, count }: PostActionButtonProps) => (
  <div className="flex items-center gap-1.5">
    <Icon className="size-6 text-text-primary" />
    {count !== undefined && (
      <span className="text-sm leading-[1.375rem] font-semibold text-text-primary">{count}</span>
    )}
  </div>
)

export { PostActionButton }
