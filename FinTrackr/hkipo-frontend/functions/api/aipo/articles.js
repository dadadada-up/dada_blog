/**
 * Cloudflare Pages Function - 获取文章列表
 * GET /api/aipo/articles
 */

import { createClient } from '@libsql/client/web'

export async function onRequest(context) {
  const { env, request } = context
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
  const offset = (page - 1) * pageSize

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

    const articlesResult = await db.execute({
      sql: `SELECT article_id, stock_code, stock_name, title, summary, word_count, published_at 
            FROM aipo_articles 
            WHERE status = 'published' 
            ORDER BY published_at DESC 
            LIMIT ? OFFSET ?`,
      args: [pageSize, offset]
    })

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM aipo_articles WHERE status = 'published'`,
      args: []
    })

    const total = countResult.rows[0]?.total || 0

    return new Response(JSON.stringify({
      success: true,
      data: {
        articles: articlesResult.rows,
        total,
        page,
        pageSize
      }
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取数据失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
