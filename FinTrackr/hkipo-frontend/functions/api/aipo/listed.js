/**
 * Cloudflare Pages Function - 获取已上市 IPO
 * GET /api/aipo/listed
 */

import { createClient } from '@libsql/client/web'

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
  const { env, request } = context
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
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

    const stocksResult = await db.execute({
      sql: `SELECT * FROM aipo_stocks 
            WHERE listing_date <= date('now')
            ORDER BY listing_date DESC
            LIMIT ? OFFSET ?`,
      args: [pageSize, offset]
    })

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM aipo_stocks WHERE listing_date <= date('now')`,
      args: []
    })

    const maskedStocks = stocksResult.rows.map(maskStock)
    const total = countResult.rows[0]?.total || 0

    return new Response(JSON.stringify({
      success: true,
      data: maskedStocks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
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
