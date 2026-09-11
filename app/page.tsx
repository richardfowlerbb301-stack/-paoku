import ParkourGame from "@/components/parkour-game"

export default function Home() {
  return <main className="game-shell"><section className="game-card">
    <div className="topbar"><div><h1 className="title">霓虹跑酷</h1><p className="sub">AuthRun · Next.js 2D Endless Runner</p></div></div>
    <ParkourGame />
    <div className="help"><span>电脑：A/D 或 ←/→ 移动 · 空格跳跃 · 可二段跳</span><span>手机：使用屏幕按钮</span></div>
  </section></main>
}
