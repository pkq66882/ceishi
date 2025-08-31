// File: serverless/api/admin.js (for Vercel/Netlify Functions)

// 假设有内存数据库用于存储评论和用户提交的文章
// 再次强调：在生产环境中，这些都需要替换为持久化数据库。
let commentsDB_Admin = []; // 存储所有评论
let userPostsDB_Admin = []; // 存储用户提交的待审核文章，格式: { id: string, title, author, content, tags, images: [], createdAt, status: 'pending'|'approved'|'rejected' }

/**
 * 这是一个Node.js Serverless Function，提供给管理员后台使用。
 * 负责获取所有评论、删除评论、管理用户提交的文章。
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 生产环境请限制为您的博客后台域名
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ===================================
    // ⚠️ 生产环境安全认证警告 ⚠️
    // 此处应添加管理员身份验证逻辑，例如检查一个秘密API Key或JWT Token。
    // 当前为DEMO目的，所有请求都被视为已授权。
    // ===================================

    // --- 评论管理 ---
    if (req.path === '/api/admin/comments') {
        if (req.method === 'GET') {
            return res.status(200).json({ success: true, comments: commentsDB_Admin });
        }
        return res.status(405).json({ success: false, message: '方法不允许。' });
    }
    if (req.path.startsWith('/api/admin/comments/')) {
        const commentId = req.path.split('/').pop(); // Extract commentId from path
        if (req.method === 'DELETE') {
            const initialLength = commentsDB_Admin.length;
            commentsDB_Admin = commentsDB_Admin.filter(c => c.id !== commentId);
            if (commentsDB_Admin.length < initialLength) {
                console.log(`管理员删除了评论: ${commentId}`);
                return res.status(200).json({ success: true, message: '评论删除成功。' });
            } else {
                return res.status(404).json({ success: false, message: '未找到评论。' });
            }
        }
        return res.status(405).json({ success: false, message: '方法不允许。' });
    }

    // --- 用户投稿管理 ---
    if (req.path === '/api/admin/posts') {
        if (req.method === 'GET') {
            // 返回所有待审核或已审核的用户投稿
            return res.status(200).json({ success: true, userPosts: userPostsDB_Admin.filter(p => p.status === 'pending') });
            // 可以扩展为带筛选的查询
        }
        return res.status(405).json({ success: false, message: '方法不允许。' });
    }
    
    if (req.path.startsWith('/api/admin/posts/') && req.path.endsWith('/approve')) {
        const userPostId = req.path.split('/')[4]; // e.g., /api/admin/posts/<id>/approve
        if (req.method === 'POST') {
            const userPostIndex = userPostsDB_Admin.findIndex(p => p.id === userPostId);
            if (userPostIndex === -1 || userPostsDB_Admin[userPostIndex].status !== 'pending') {
                return res.status(404).json({ success: false, message: '未找到待审核的用户投稿。' });
            }

            const approvedPost = userPostsDB_Admin[userPostIndex];
            approvedPost.status = 'approved';
            approvedPost.updatedAt = new Date().toISOString();

            // 为GitHub Pages的 posts.json 格式化
            const postContent = {
                id: `post_${approvedPost.createdAt.replace(/[-:.]/g, '')}`, // Create unique hash
                title: approvedPost.title,
                content: approvedPost.content,
                tags: approvedPost.tags,
                createdAt: approvedPost.createdAt,
                updatedAt: approvedPost.updatedAt,
                author: approvedPost.author // 可以添加作者信息到博客 post
            };
            
            // ⚠️ 重点: 在真正的系统中，这里应该触发一个GitHub Action或另一个后端服务，
            // 来将 postContent 添加到 posts.json 并推送到GitHub仓库。
            // 因为Serverless Function无法直接访问GitHub Token来修改仓库内容，这需要一个受信任的自动化流程。
            // 目前这个DEMO只是返回 formatted postContent 给前端admin.html让它来完成GitHub操作。
            // 这是一个妥协，以便在纯JS前端实现。生产环境应将此步骤完全后端化。
            
            console.log(`管理员批准了用户投稿: ${userPostId}`);
            return res.status(200).json({ success: true, message: '用户投稿已批准。', postContent: postContent });
        }
        return res.status(405).json({ success: false, message: '方法不允许。' });
    }

    if (req.path.startsWith('/api/admin/posts/') && req.path.endsWith('/reject')) {
        const userPostId = req.path.split('/')[4];
        if (req.method === 'DELETE') {
            const userPostIndex = userPostsDB_Admin.findIndex(p => p.id === userPostId);
            if (userPostIndex === -1 || userPostsDB_Admin[userPostIndex].status !== 'pending') {
                return res.status(404).json({ success: false, message: '未找到待审核的用户投稿。' });
            }

            userPostsDB_Admin[userPostIndex].status = 'rejected';
            userPostsDB_Admin[userPostIndex].updatedAt = new Date().toISOString();
            console.log(`管理员拒绝了用户投稿: ${userPostId}`);
            return res.status(200).json({ success: true, message: '用户投稿已拒绝。' });
        }
        return res.status(405).json({ success: false, message: '方法不允许。' });
    }

    // --- 用户提交文章 API (前端用户调用) ---
    // 这个API也放在Admin API中，但理论上可以单独部署，因为它不要求管理员身份
    if (req.path === '/api/admin/posts/submit') {
        if (req.method === 'POST') {
            try {
                const { title, author, content, tags, images } = req.body;
                if (!title || !author || !content) {
                    return res.status(400).json({ success: false, message: '标题、作者和内容是必需的。' });
                }

                const newUserPost = {
                    id: `user_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: title.substring(0, 100),
                    author: author.substring(0, 50),
                    content: content.substring(0, 5000), // 限制内容长度
                    tags: tags || [],
                    images: images || [], // 暂时只记录URL或文件名，实际应存到云存储
                    createdAt: new Date().toISOString(),
                    status: 'pending' // 待审核
                };
                userPostsDB_Admin.push(newUserPost);
                console.log(`用户提交了新文章: ${newUserPost.id}`);
                return res.status(201).json({ success: true, message: '文章已提交，等待管理员审核。' });
            } catch (error) {
                console.error('用户提交文章失败:', error);
                return res.status(500).json({ success: false, message: '服务器内部错误，文章提交失败。' });
            }
        }
        return res.status(405).json({ success: false, message: '方法不允许。' });
    }

    return res.status(404).json({ success: false, message: '未找到API路由。' });
};
