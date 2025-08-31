// js/common.js
const GITHUB_USERNAME = '[YOUR_GITHUB_USERNAME]'; // 替换为你的 GitHub 用户名
const GITHUB_REPO = '[YOUR_REPOSITORY_NAME]';     // 替换为你的 GitHub 仓库名
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/`;

let GITHUB_TOKEN = localStorage.getItem('github_pat_token') || ''; // 尝试从 localStorage 读取 Token
let GITHUB_TOKEN_SHA = {}; // 用于存储文件的 SHA，以便更新文件

// 将字符串编码为 Base64
function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// 将 Base64 字符串解码
function base64Decode(str) {
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch (e) {
        console.error("Base64 decode failed:", e);
        return str; // 返回原始字符串或处理错误
    }
}

// 通用的 GitHub API 请求函数
async function githubRequest(url, method = 'GET', data = null) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
    };

    const config = {
        method: method,
        headers: headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        // 如果是 401 或 403，意味着 Token 无效或过期
        if (response.status === 401 || response.status === 403) {
             console.error('GitHub API 认证失败或权限不足。请检查 Token。');
             // 清除存储的 Token，强制用户重新输入
             localStorage.removeItem('github_pat_token');
             GITHUB_TOKEN = ''; // 重置全局 Token 变量
             if (location.pathname.includes('admin.html')) {
                 alert('GitHub Token 无效或已过期，请重新输入。');
                 location.reload(); // 刷新页面以便重新输入 Token
             }
             throw new Error('Authentication failed or insufficient permissions.');
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API Error: ${response.status} - ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Network or GitHub API Error:', error);
        throw error;
    }
}

// 读取文件内容
async function readFile(filePath) {
    const url = `${GITHUB_API_BASE}${filePath}`;
    try {
        const data = await githubRequest(url);
        GITHUB_TOKEN_SHA[filePath] = data.sha; // 存储 SHA 值用于后续更新
        return base64Decode(data.content);
    } catch (error) {
        if (error.message.includes('{"message":"Not Found"')) { // File not found
            console.warn(`File ${filePath} not found, will create it.`);
            return null;
        }
        throw error;
    }
}

// 写入/更新文件内容
async function writeFile(filePath, content, message, isNewFile = false) {
    const url = `${GITHUB_API_BASE}${filePath}`;
    const data = {
        message: message,
        content: base64Encode(content),
        branch: 'main' // 假设你的主分支是 main
    };

    if (!isNewFile && GITHUB_TOKEN_SHA[filePath]) {
        data.sha = GITHUB_TOKEN_SHA[filePath]; // 更新文件需要 SHA
    } else if (!isNewFile && !GITHUB_TOKEN_SHA[filePath]) {
        // 如果不是新文件但没有 SHA，表示尝试修改一个不存在或未被读取的文件，应该先读取它
        const existingContent = await readFile(filePath);
        if (existingContent !== null) { // 如果文件确实存在
            data.sha = GITHUB_TOKEN_SHA[filePath];
        } else {
             // 如果文件不存在，将其视为创建新文件
            isNewFile = true;
        }
    }


    try {
        const response = await githubRequest(url, 'PUT', data);
        GITHUB_TOKEN_SHA[filePath] = response.content.sha; // 更新 SHA 值
        console.log(`Successfully wrote file: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
}


// 删除文件
async function deleteFile(filePath, message) {
    const url = `${GITHUB_API_BASE}${filePath}`;
    // 删除文件也需要 SHA
    const data = {
        message: message,
        sha: GITHUB_TOKEN_SHA[filePath], // 必须带上 SHA
        branch: 'main'
    };

    try {
        await githubRequest(url, 'DELETE', data);
        delete GITHUB_TOKEN_SHA[filePath]; // 从记录中移除 SHA
        console.log(`Successfully deleted file: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        throw error;
    }
}


// 辅助函数：显示消息
function showMessage(element, text, isError = false) {
    element.textContent = text;
    element.className = isError ? 'error-message' : 'message';
    element.style.display = 'block';
    setTimeout(() => {
        element.style.
