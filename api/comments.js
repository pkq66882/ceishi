// File: serverless/api/comments.js (for Vercel/Netlify Functions)

// 假设我们有一个简单的内存数据库（在生产环境中需要替换为持久化数据库，如MongoDB Atlas, Firestore, PlanetScale等）
// 在实际部署中，每次Serverless Function冷启动，这个内存数组会重置。
// 仅为DEMO目的。生产环境请使用外部数据库。
let commentsDB = []; // 格式: { id: string, postId: string, author: string, content: string, createdAt: string }

/**
 * 这是一个Node.js Serverless Function，用于处理评论的提交和获取。
 * 部署到 Vercel/Netlify Functions 等平台后，它将提供一个后端API。
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有源访问，生产环境请限制为您的博客域名
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理OPTIONS请求（CORS预检）
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 处理 GET 请求: 获取评论
    if (req.method === 'GET') {
        const { postId } = req.query;
        if (!postId) {
            return res.status(400).json({ success: false, message: 'postId 参数是必需的。' });
        }
        const postComments = commentsDB.filter(c => c.postId === postId);
        return res.status(200).json({ success: true, comments: postComments });
    }

    // 处理 POST 请求: 提交评论
    if (req.method === 'POST') {
        try {
            const { postId, author, content } = req.body; // req.body 已经被解析为JSON（取决于Serverless平台配置）
            if (!postId || !author || !content) {
                return res.status(400).json({ success: false, message: 'postId, author 和 content 字段是必需的。' });
            }

            const newComment = {
                id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                postId,
                author: author.substring(0, 50), // 限制作者名长度
                content: content.substring(0, 1000), // 限制评论内容长度
                createdAt: new Date().toISOString()
            };

            commentsDB.push(newComment);
            console.log(`新评论提交: ${JSON.stringify(newComment)}`);
            return res.status(201).json({ success: true, message: '评论提交成功！', comment: newComment });
        } catch (error) {
            console.error('评论提交失败:', error);
            return res.status(500).json({ success: false, message: '服务器内部错误，评论提交失败。' });
        }
    }

    // 处理 DELETE 请求: 删除评论 (仅限管理员API调用，这里简化处理，生产环境需身份验证)
    if (req.method === 'DELETE') {
        const { commentId } = req.query; // 或从 req.params 获取，取决于路由配置
        if (!commentId) {
            return res.status(400).json({ success: false, message: 'commentId 参数是必需的。' });
        }

        const initialLength = commentsDB.length;
        commentsDB = commentsDB.filter(c => c.id !== commentId);

        if (commentsDB.length < initialLength) {
            console.log(`评论 ${commentId} 删除成功。`);
            return res.status(200).json({ success: true, message: '评论删除成功。' });
        } else {
            return res.status(404).json({ success: false, message: '未找到该评论。' });
        }
    }

    // 不支持的请求方法
    return res.status(405).json({ success: false, message: '方法不允许。' });
};

