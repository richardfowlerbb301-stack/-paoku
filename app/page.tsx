import { auth, signIn, signOut } from "@/auth"
import ParkourGame from "@/components/parkour-game"

export default async function Home() {
  const session = await auth()
  return <main className="game-shell"><section className="game-card">
    <div className="topbar"><div><h1 className="title">霓虹跑酷</h1><p className="sub">AuthRun · Next.js 2D Endless Runner</p></div><div className="stats"><div className="stat"><span>玩家</span><b>{session?.user?.name ?? "游客"}</b></div></div></div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
      {session?.user ? <form action={async () => { "use server"; await signOut() }}><button className="primary" type="submit">退出登录</button></form> : <div style={{display:"flex",gap:8}}><form action={async () => { "use server"; await signIn("github") }}><button className="primary" type="submit">GitHub 登录</button></form><form action={async () => { "use server"; await signIn("google") }}><button className="primary" type="submit">Google 登录</button></form></div>}
    </div>
    <ParkourGame />
    <div className="help"><span>电脑：A/D 或 ←/→ 移动 · 空格跳跃 · 可二段跳</span><span>手机：使用屏幕按钮</span></div>
  </section></main>
}
