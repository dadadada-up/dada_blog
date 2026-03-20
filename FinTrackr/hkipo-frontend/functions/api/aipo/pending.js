/**
 * Cloudflare Pages Function - 获取待申购 IPO
 * GET /api/aipo/pending
 */

import { createClient } from '@libsql/client/web'

// 数据脱敏函数
function maskStock(stock) {
  const masked = { ...stock }
  masked.pe_ratio = null
  masked.subscription_multiple = null
  masked.lot_winning_rate = null
  masked.ai_analysis = null
  masked.recommendation = null
  masked.recommendation_score = null
  return masked
}

export async function onRequest(context) {
  const { env } = context
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  // 处理 OPTIONS 预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 创建 Turso 客户端
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    })

    // 查询待申购的股票
    const result = await db.execute({
      sql: `SELECT * FROM aipo_stocks 
            WHERE subscription_end > datetime('now')
            ORDER BY listing_date ASC
            LIMIT 50`,
      args: []
    })

    // 数据脱敏
    const maskedStocks = result.rows.map(maskStock)

    return new Response(JSON.stringify({
      success: true,
      data: maskedStocks,
      count: maskedStocks.length
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Error:', error)
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
