# 自动收件后台（一次性配置）

GitHub Pages 继续托管答题页；Cloudflare Worker 接收提交，D1 保存记录。密码和数据库绑定只设置在 Cloudflare，不要放进 GitHub 文件。

1. 在 Cloudflare Dashboard 创建 D1 数据库 `jiarui-assessment-submissions`，打开 Console 并执行本目录的 `schema.sql`。
2. 创建 Worker `jiarui-assessment-api`，将 `worker.mjs` 的完整内容作为 Module Worker 发布。
3. 在 Worker 的 Settings → Bindings 中添加 D1 database binding：变量名 `DB`，选择刚创建的数据库。
4. 在 Settings → Variables and Secrets 添加 Secret：名称 `ADMIN_PASSWORD`，设置仅你知道的长密码；随后重新部署 Worker。
5. 测试 Worker 的 `/api/submissions` 接口和 GitHub Pages 来源：`https://shuffletongue.github.io`。
6. 将 Worker 的 `workers.dev` 根网址填入仓库根目录 `config.js` 的 `ASSESSMENT_API_URL`，提交后 GitHub Pages 自动更新。告诉我这个公开 Worker 网址即可，我可以代为设置前端并完成联调；不要把查看密码发到聊天里。

后台查看页：`https://shuffletongue.github.io/jiarui-assessment-v1/admin.html`。提交接口按 `submissionId` 幂等去重；最多保留最近 50 条用于页面查看。数据库写入失败时，学生端结果仍留在该设备，并显示重试与应急备份。

## 本地检查

在仓库根目录运行 `node backend/test.mjs`。它以内存模拟 D1，检查正常提交、重复提交、未授权读取、跨站来源和无效结果。
