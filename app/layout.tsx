import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "霓虹跑酷 | AuthRun",
  description: "一个基于 Next.js 的 2D 无限跑酷游戏",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
