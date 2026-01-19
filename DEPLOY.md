# StratLog CS2 Cloud (Next.js)

这是一个适配 Vercel 的云端战术平台。

## 部署步骤

1. **准备 Pusher 账号**：
   - 到 [Pusher 官网](https://pusher.com/) 注册。
   - 创建一个 **Channels** 应用（用于实时更新）。
   - 创建一个 **Beams** 应用（用于手机通知）。

2. **配置环境变量**：
   在 Vercel 控制台中配置以下变量：
   - `PUSHER_APP_ID`: Channels 应用 ID
   - `NEXT_PUBLIC_PUSHER_KEY`: Channels Key
   - `PUSHER_SECRET`: Channels Secret
   - `NEXT_PUBLIC_PUSHER_CLUSTER`: 例如 `ap3`
   - `PUSHER_BEAMS_INSTANCE_ID`: Beams Instance ID
   - `PUSHER_BEAMS_SECRET_KEY`: Beams Secret Key (Bearer Token)
   - `NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID`: 同上，前端需要

3. **推送代码**：
   ```bash
   git init
   git add .
   git commit -m "Initialize StratLog Cloud"
   gh repo create stratlog-cs2 --public --source=. --remote=origin
   git push -u origin main
   ```

4. **Vercel 部署**：
   导入你的 GitHub 仓库，选择 Next.js 框架，填好环境变量后点击 Deploy。

## 本地开发

```bash
npm install
npm run dev
```
