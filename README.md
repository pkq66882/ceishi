# 期望AI半静态博客引擎

这是一个由期望AI打造的半静态博客解决方案，结合了 GitHub Pages 的免费部署优势和后台管理能力。
**所有文章内容、网站配置、样式调整均可通过管理员后台进行管理和发布。** 同时，通过集成 **Giscus** 评论系统，您的博客也支持用户互动评论（读者需拥有 GitHub 账号）。

## 核心特性

*   **完全托管式内容管理**：所有博客数据 (文章、配置) 存储在您的 GitHub 仓库中。
*   **直观的管理员后台**：提供富文本编辑器（TinyMCE）进行文章撰写，以及全面的网站设置调整。
*   **GitHub Pages 部署**：免费、快速、全球CDN加速的静态网站托管。
*   **Giscus 评论系统**：基于 GitHub Discussions 的评论，无需额外服务器，评论数据由 GitHub 管理。
*   **高度可定制的样式**：通过后台可调整配色、背景图、深色模式等。
*   **代码高亮**：文章中的代码块支持高亮显示（由 Prism.js 提供）。
*   **Responsive Design**：移动端和桌面端友好。
*   **图片上传与优化**：直接上传图片到 GitHub 仓库，并通过 `gh-proxy.com` 加速国内访问。

## 部署教程

### 步骤 1: 创建 GitHub 仓库

1.  登录 GitHub。
2.  创建一个新的公共仓库。
    *   **如果您想创建个人/组织主页博客**：仓库名称必须是 `your-username.github.io` (例如：`rjdsq.github.io`)。
    *   **如果您想创建项目博客（在子路径下）**：仓库名称可以是任何您想要的（例如：`blog` 或 `my-personal-blog`）。假设您的项目博客部署在 `your-username.github.io/blog`。
3.  初始化仓库时，**不要勾选** "Add a README file"、"Add .gitignore" 或 "Choose a license"。我们将在下一步手动添加文件。

### 步骤 2: 上传博客文件

将本项目提供的 `index.html`, `admin.html`, `config.json`, `posts.json` (以及可选的 `images` 文件夹和 `.gitkeep` 文件) 上传到您的新 GitHub 仓库的 **根目录**。

*   **如果您的仓库是 `your-username.github.io` (个人主页)**：所有文件直接放在仓库根目录。
*   **如果您的仓库是 `my-project-repo` (项目页面)**：所有文件直接放在仓库根目录。在 GitHub Pages 设置中，您可能需要将 `Source` 设置为 `main` 分支的 `/ (root)`。您的博客将通过 `your-username.github.io/my-project-repo` 访问。

### 步骤 3: 启用 GitHub Pages

1.  在您的 GitHub 仓库页面，点击 **Settings (设置)**。
2.  在左侧导航栏找到 **Pages**。
3.  在 "Source" 部分，确保 `Branch` 设置为 `main` (或您使用的默认分支)，并选择 `/ (root)` 或 `/docs` (根据您将文件放置的位置)。通常，直接放在根目录选择 `/ (root)` 即可。
4.  点击 **Save (保存)**。
5.  GitHub Pages 会自动部署您的网站。这可能需要几分钟。部署完成后，您会在页面顶部看到您的博客网址 (例如 `https://your-username.github.io` 或 `https://your-username.github.io/my-project-repo`)。

### 步骤 4: 获取 GitHub Personal Access Token

为了让 `admin.html` 能够修改您的 GitHub 仓库内容，您需要一个具备 `repo` 权限的 Personal Access Token (PAT)。

1.  登录 GitHub。
2.  点击右上角的头像，选择 **Settings (设置)**。
3.  在左侧导航栏最底部，点击 **Developer settings (开发者设置)**。
4.  点击 **Personal access tokens (个人访问令牌)** > **Tokens (classic) (令牌 (经典))**。
5.  点击 **Generate new token (生成新令牌)** > **Generate new token (classic) (生成新令牌(经典))**。
6.  **Note (备注)**：给您的 Token 起一个有意义的名字 (例如 "ExpectAI Blog Admin")。
7.  **Expiration (有效期)**：选择合适的有效期，建议设置为 90 天或更长。
8.  **Select scopes (选择范围)**：**勾选 `repo` (所有子选项自动勾选)**。这允许您的后台管理程序读取和写入您的仓库。
    **重要提示：请谨慎管理您的 Token，不要泄露。拥有 `repo` 权限的 Token 可以完全控制您的仓库。**
9.  点击 **Generate token (生成令牌)**。
10. **复制生成的 Token**。此 Token 只显示一次，请务必妥善保存。

### 步骤 5: 配置和管理您的博客

1.  **访问管理后台**：
    *   如果您的博客是 `your-username.github.io`，访问 `https://your-username.github.io/admin.html`。
    *   如果您的博客是 `your-username.github.io/my-project-repo`，访问 `https://your-username.github.io/my-project-repo/admin.html`。
2.  在登录界面，粘贴您在步骤 4 中获取的 GitHub Personal Access Token。
3.  点击 **"开始"**。系统将验证您的 Token，加载博客数据。
    *   如果是首次启动，且 `config.json` 或 `posts.json` 为空，系统将自动创建默认配置和空的文章列表。
4.  **网站设置**：
    *   导航到 "网站设置" 页面，更新您的博客标题、描述，调整颜色主题、背景图等。
    *   **重要：配置 Giscus 评论系统。**
        *   访问 [Giscus 官网](https://giscus.app/)。
        *   按照 Giscus 的官方配置向导，选择您的仓库，并生成配置。
        *   将 Giscus 提供的 `Repository` (仓库名), `Repository ID` (仓库ID), `Discussion Category` (讨论分类名) 和 `Category ID` (分类ID) 复制到后台的对应输入框中。
        *   完成后点击 "保存设置"。
5.  **文章管理**：
    *   导航到 "管理文章" 页面，您可以撰写新文章、编辑或删除现有文章。
    *   使用集成的富文本编辑器轻松编写内容。您可以使用 **“插入摘要分隔符”** 按钮在文章中插入 `<!--more-->` 标签，以在文章列表页创建摘要。
    *   可以直接在编辑器中上传图片，图片会自动上传到您仓库的 `images/` 目录，并插入到文章中。上传的图片 URL 会通过 `gh-proxy.com` 代理，以提升国内访问速度。
    *   文章发布或更新后，这些更改会立即提交到您的 GitHub 仓库，并由 GitHub Pages 自动重新部署。

## 开发注意事项

*   **Token 安全**：您的 GitHub Personal Access Token 在浏览器 Session Storage 中存储。关闭浏览器后会失效，需要重新输入。请勿在公共或不信任的设备上使用。为了提高安全性，可以考虑定期更换 Token。
*   **Giscus 配置**：Giscus 依赖 GitHub Discussions，请确保您的 GitHub 仓库已经启用了 Discussions 功能，并且安装了 Giscus App。如果配置不正确，评论功能将不可用。
*   **部署路径**：如果您的博客部署在子路径 (例如 `your-username.github.io/my-blog`)，请确保 `index.html` 和 `admin.html` 中的相对路径和 GitHub API 调用路径能够正确适配。本代码已尝试进行通用路径适配。
*   **性能优化**：对于大量图片，可以考虑使用 CDN，或对图片进行压缩优化。本项目已默认通过 `gh-proxy.com` 进行国内访问优化。
*   **用户发帖**：本项目专注于管理员后台管理和用户评论。如果需要开放普通用户发帖功能，将需要一个独立的后端服务来处理用户认证、数据存储和对 GitHub 仓库的写入操作（例如通过 pull request 流程）。
*   **TinyMCE API key**: 在 `admin.html` 中，TinyMCE 的 `<script>` 标签使用了 `no-api-key`。**在生产环境中，强烈建议到 <a href="https://www.tiny.cloud/auth/signup/" target="_blank">TinyMCE 官网免费注册</a> 获取一个 API key，并替换掉 `no-api-key`**。否则，TinyMCE 可能会在控制台显示警告或限制功能。

## 贡献与反馈

如果您有任何 Bug 报告、功能建议或贡献想法，欢迎通过 GitHub Issue 或 Pull Request 与 `期望AI` 交流。
