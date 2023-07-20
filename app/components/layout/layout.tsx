import { Footer, Nav } from "~/components"

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-[1] px-6 mt-20">{children}</main>
      <Footer />
    </div>
  )
}
