import { Container } from '@/shared/ui'
import { Gnb } from '@/widgets/gnb'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Gnb />
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
    </div>
  )
}

export default MainLayout
