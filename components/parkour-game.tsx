"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Rect = { x: number; y: number; w: number; h: number }
type Coin = { x: number; y: number; r: number; taken: boolean }

const W = 960
const H = 540
const GROUND = 455

function hit(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export default function ParkourGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef<Record<string, boolean>>({})
  const raf = useRef<number | null>(null)
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [best, setBest] = useState(0)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const start = useCallback(() => {
    setScore(0)
    setCoins(0)
    setGameOver(false)
    setRunning(true)
  }, [])

  useEffect(() => {
    const saved = Number(localStorage.getItem("paoku-best") || 0)
    setBest(saved)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) e.preventDefault()
      keys.current[e.key.toLowerCase()] = true
      if ((e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") && !running) start()
    }
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up) }
  }, [running, start])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let player: Rect & { vy: number; jumps: number } = { x: 150, y: GROUND - 52, w: 34, h: 52, vy: 0, jumps: 0 }
    let world = 0
    let distance = 0
    let collected = 0
    let obstacles: Rect[] = []
    let platforms: Rect[] = [{ x: -300, y: GROUND, w: 1500, h: 85 }]
    let coinsList: Coin[] = []
    let last = performance.now()
    let spawnAt = 650
    let jumpWasDown = false
    let ended = false

    const resetWorld = () => {
      player = { x: 150, y: GROUND - 52, w: 34, h: 52, vy: 0, jumps: 0 }
      world = 0; distance = 0; collected = 0; obstacles = []
      platforms = [{ x: -300, y: GROUND, w: 1500, h: 85 }]
      coinsList = []; spawnAt = 650; ended = false
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, "#121a42"); sky.addColorStop(1, "#080b18")
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = "rgba(124,92,255,.18)"
      for (let i = 0; i < 7; i++) { const x = ((i * 190 - world * .18) % 1150) - 100; ctx.fillRect(x, 310 - (i % 3) * 35, 80, 145) }
      ctx.fillStyle = "#1d274e"
      platforms.forEach(p => { const x = p.x - world; if (x < W && x + p.w > 0) ctx.fillRect(x, p.y, p.w, p.h) })
      ctx.fillStyle = "#ff4d8d"
      obstacles.forEach(o => { const x = o.x - world; if (x < W && x + o.w > 0) { ctx.fillRect(x, o.y, o.w, o.h); ctx.fillStyle = "#ff9cba"; ctx.fillRect(x + 7, o.y + 7, o.w - 14, 5); ctx.fillStyle = "#ff4d8d" } })
      coinsList.forEach(c => { if (c.taken) return; const x = c.x - world; ctx.beginPath(); ctx.arc(x, c.y, c.r, 0, Math.PI * 2); ctx.fillStyle = "#ffd34e"; ctx.fill(); ctx.strokeStyle = "#fff0a6"; ctx.stroke() })
      const px = player.x
      ctx.fillStyle = "#7c5cff"; ctx.fillRect(px, player.y + 12, player.w, player.h - 12)
      ctx.fillStyle = "#e7eaff"; ctx.beginPath(); ctx.arc(px + 17, player.y + 10, 13, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#11152d"; ctx.fillRect(px + 22, player.y + 7, 4, 4)
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(0, GROUND + 2, W, 2)
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2); last = now
      if (running && !ended) {
        const speed = 4.2 + Math.min(distance / 2500, 3)
        world += speed * dt; distance += speed * dt
        const left = keys.current["arrowleft"] || keys.current["a"]
        const right = keys.current["arrowright"] || keys.current["d"]
        if (left) player.x -= 5 * dt
        if (right) player.x += 5 * dt
        player.x = Math.max(45, Math.min(430, player.x))
        const jumpDown = !!(keys.current[" "] || keys.current["arrowup"] || keys.current["w"])
        if (jumpDown && !jumpWasDown && player.jumps < 2) { player.vy = -12.5; player.jumps++ }
        jumpWasDown = jumpDown
        player.vy += .62 * dt; player.y += player.vy * dt
        let grounded = false
        for (const p of platforms) {
          const screenP = { ...p, x: p.x - world }
          if (player.vy >= 0 && hit(player, { x: screenP.x, y: p.y - 4, w: p.w, h: 10 }) && player.y + player.h <= p.y + 12) { player.y = p.y - player.h; player.vy = 0; player.jumps = 0; grounded = true }
        }
        if (!grounded && player.y > H + 40) ended = true
        if (world > spawnAt) {
          const gap = 190 + Math.random() * 180
          const height = 30 + Math.random() * 45
          obstacles.push({ x: world + 900, y: GROUND - height, w: 30 + Math.random() * 30, h: height })
          if (Math.random() > .35) coinsList.push({ x: world + 900 + gap / 2, y: GROUND - 110 - Math.random() * 90, r: 10, taken: false })
          if (Math.random() > .45) platforms.push({ x: world + 900 + gap, y: GROUND - 95 - Math.random() * 80, w: 140, h: 20 })
          spawnAt = world + gap
        }
        const pr = { x: player.x, y: player.y, w: player.w, h: player.h }
        for (const o of obstacles) if (hit(pr, { ...o, x: o.x - world })) ended = true
        for (const c of coinsList) if (!c.taken && Math.abs(c.x - world - (player.x + player.w / 2)) < 28 && Math.abs(c.y - (player.y + player.h / 2)) < 35) { c.taken = true; collected++; setCoins(collected) }
        obstacles = obstacles.filter(o => o.x - world > -100)
        platforms = platforms.filter(p => p.x - world > -500)
        coinsList = coinsList.filter(c => c.x - world > -100 && !c.taken || !c.taken)
        const nextScore = Math.floor(distance / 5) + collected * 50
        setScore(nextScore)
        setBest(b => { const n = Math.max(b, nextScore); localStorage.setItem("paoku-best", String(n)); return n })
      }
      draw()
      if (ended && running) { setRunning(false); setGameOver(true) }
      raf.current = requestAnimationFrame(loop)
    }
    resetWorld()
    raf.current = requestAnimationFrame(loop)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [running])

  const press = (key: string, down: boolean) => { keys.current[key] = down }

  return <div>
    <div className="canvas-wrap">
      <canvas ref={canvasRef} className="game-canvas" width={W} height={H} aria-label="2D无限跑酷游戏" />
      {!running && <div className="overlay"><div className="panel"><h2>{gameOver ? "💥 游戏结束" : "🏃 霓虹跑酷"}</h2><p>{gameOver ? `本局 ${score} 分 · 金币 ${coins}` : "躲开障碍，跳得更远！"}</p><button className="primary" onClick={start}>{gameOver ? "再来一局" : "开始游戏"}</button></div></div>}
    </div>
    <div className="touch">
      <button onPointerDown={() => press("a", true)} onPointerUp={() => press("a", false)} onPointerLeave={() => press("a", false)}>←</button>
      <button onPointerDown={() => press(" ", true)} onPointerUp={() => press(" ", false)} onPointerLeave={() => press(" ", false)}>跳跃</button>
      <button onPointerDown={() => press("d", true)} onPointerUp={() => press("d", false)} onPointerLeave={() => press("d", false)}>→</button>
    </div>
  </div>
}
