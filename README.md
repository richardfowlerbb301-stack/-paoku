# 霓虹跑酷（AuthRun）

基于 Next.js + React + Auth.js 的 2D 无限跑酷小游戏。

## 已实现

- 自动向前奔跑
- A/D 或方向键移动
- 空格 / W / ↑ 跳跃，支持二段跳
- 随机障碍物、跳台和金币
- 距离 + 金币计分
- 本机最高分（localStorage）
- 手机触控按钮
- Auth.js GitHub / Google 登录
- JWT Session，不把 OAuth 密钥放进前端

## 本地运行

需要 Node.js 20+。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

认证功能需要把 `.env.example` 复制成 `.env.local` 并填写 OAuth 参数。没有配置 OAuth 时，游戏代码本身仍然是独立的，但登录按钮无法完成第三方登录。

## GitHub OAuth 回调

开发环境通常使用：

`http://localhost:3000/api/auth/callback/github`

## 游戏操作

电脑：A/D 或 ←/→ 移动，空格/W/↑ 跳跃。

手机：使用画面下方的左右和跳跃按钮。
