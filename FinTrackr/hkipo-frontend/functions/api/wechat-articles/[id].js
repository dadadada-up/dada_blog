/**
 * 删除公众号文章
 * DELETE /api/wechat-articles/:id
 */

import { createClient } from '@libsql/client/web'

export async function onRequestDelete(context) {
  try {
    const { env, params } = context
    const id = params.id

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: '文章ID不能为空'
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

    await db.execute({
      sql: `DELETE FROM wechat_articles WHERE id = ?`,
      args: [id]
    })

    return new Response(JSON.stringify({
      success: true,
      message: '文章删除成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Delete wechat article error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '删除文章失败',
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
