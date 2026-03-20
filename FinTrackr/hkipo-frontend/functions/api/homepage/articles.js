/**
 * Cloudflare Pages Function - 最新文章接口
 * GET /api/homepage/articles
 */

import { createTursoClient, queryMany } from '../../_utils/db.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

export async function onRequest(context) {
  const { env, request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '5')

  try {
    const db = createTursoClient(env)

    // 先尝试从 wechat_articles 获取
    const wechatArticles = await queryMany(
      db,
      `SELECT 
        id as article_id,
        title,
        summary,
        url,
        cover_image,
        author,
        published_at,
        'wechat' as source
      FROM wechat_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT ?`,
      [limit]
    )
    
    if (wechatArticles && wechatArticles.length > 0) {
      const articles = wechatArticles.map(a => ({
        articleId: a.article_id,
        title: a.title,
        summary: a.summary,
        url: a.url,
        coverImage: a.cover_image,
        author: a.author || 'Z掌柜',
        publishedAt: a.published_at,
        source: 'wechat'
      }))

      return new Response(JSON.stringify({
        success: true,
        data: articles,
        total: articles.length
      }), {
        headers: corsHeaders
      })
    }

    // 如果没有微信文章，从 articles 表获取
    const articles = await queryMany(
      db,
      `SELECT 
        article_id,
        title,
        summary,
        cover_image,
        author,
        created_at,
        stock_code
      FROM articles
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT ?`,
      [limit]
    )
    
    const result = articles.map(a => ({
      articleId: a.article_id,
      title: a.title,
      summary: a.summary,
      coverImage: a.cover_image,
      author: a.author || 'Z掌柜',
      publishedAt: a.created_at,
      stockCode: a.stock_code,
      source: 'local'
    }))

    return new Response(JSON.stringify({
      success: true,
      data: result,
      total: result.length
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
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
