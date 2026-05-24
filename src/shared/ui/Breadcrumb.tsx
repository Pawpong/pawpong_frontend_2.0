interface BreadcrumbProps {
  items: string[]
  className?: string
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav className={className ?? 'hidden text-sm leading-[1.375rem] font-medium tab:block'}>
      {items.map((item, index) => (
        <span
          key={item}
          className={index < items.length - 1 ? 'text-text-muted' : 'text-text-primary'}
        >
          {item}
          {index < items.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  )
}

export { Breadcrumb }
