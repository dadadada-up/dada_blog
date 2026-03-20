/**
 * 公众号文章 API
 * GET /api/wechat-articles - 获取文章列表
 */

import { createClient } from '@libsql/client/web'

export async function onRequestGet(context) {
  try {
    const { env, request } = context
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    })

    // 先尝试创建表（如果不存在）
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wechat_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        summary TEXT,
        url TEXT NOT NULL,
        cover_image TEXT,
        author TEXT DEFAULT 'Z掌柜',
        view_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        published_at TEXT DEFAULT (datetime('now')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // 查询文章列表
    const result = await db.execute({
      sql: `SELECT * FROM wechat_articles WHERE status = 'published' ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      args: [pageSize, offset]
    })

    // 查询总数
    const countResult = await db.execute(`SELECT COUNT(*) as total FROM wechat_articles WHERE status = 'published'`)

    const data = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      url: row.url,
      coverImage: row.cover_image,
      author: row.author,
      viewCount: row.view_count,
      publishedAt: row.published_at
    }))

    return new Response(JSON.stringify({
      success: true,
      data: {
        list: data,
        total: countResult.rows[0]?.total || 0,
        page,
        pageSize
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Wechat articles error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取文章列表失败',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

/**
 * POST - 创建文章
 */
export async function onRequestPost(context) {
  try {
    const { env, request } = context
    const body = await request.json()
    const { title, summary, url, coverImage, author } = body

    if (!title || !url) {
      return new Response(JSON.stringify({
        success: false,
        message: '标题和链接不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    })

    // 确保表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wechat_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        summary TEXT,
        url TEXT NOT NULL,
        cover_image TEXT,
        author TEXT DEFAULT 'Z掌柜',
        view_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        published_at TEXT DEFAULT (datetime('now')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)

    const result = await db.execute({
      sql: `INSERT INTO wechat_articles (title, summary, url, cover_image, author) VALUES (?, ?, ?, ?, ?)`,
      args: [title, summary || '', url, coverImage || '', author || 'Z掌柜']
    })

    return new Response(JSON.stringify({
      success: true,
      message: '文章创建成功',
      data: { id: result.lastInsertRowid }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Create wechat article error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '创建文章失败',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
