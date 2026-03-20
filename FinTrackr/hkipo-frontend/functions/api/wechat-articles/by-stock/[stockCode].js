/**
 * Cloudflare Pages Function - 按股票代码获取关联文章
 * GET /api/wechat-articles/by-stock/[stockCode]
 */

import { createClient } from '@libsql/client/web'

export async function onRequest(context) {
  const { env, params } = context
  const stockCode = params.stockCode

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    })

    // 通过关联表查询文章
    const result = await db.execute({
      sql: `
        SELECT 
          wa.id,
          wa.title,
          wa.summary,
          wa.url,
          wa.cover_image,
          wa.author,
          wa.published_at
        FROM wechat_articles wa
        INNER JOIN wechat_article_stocks was ON wa.id = was.article_id
        WHERE was.stock_code = ? AND wa.status = 'published'
        ORDER BY wa.published_at DESC
        LIMIT 10
      `,
      args: [stockCode]
    })

    const articles = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      url: row.url,
      coverImage: row.cover_image,
      author: row.author || 'Z掌柜',
      publishedAt: row.published_at
    }))

    return new Response(JSON.stringify({
      success: true,
      data: articles
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Get articles by stock error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取文章失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
