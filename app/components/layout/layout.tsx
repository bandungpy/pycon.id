import { Footer, Nav } from "~/components"

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mt-20 flex-[1] lg:mt-36">{children}</main>
      <Footer />
    </div>
  )
}
