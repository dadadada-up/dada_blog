/**
 * Cloudflare Pages Function - 获取 IPO 统计数据
 * GET /api/aipo/stats/overview
 */

import { createClient } from '@libsql/client/web'

export async function onRequest(context) {
  const { env } = context

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

    const subscriptionResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM aipo_stocks 
            WHERE subscription_start <= date('now') AND subscription_end >= date('now')`,
      args: []
    })

    const greyMarketResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM aipo_stocks WHERE date(result_date) = date('now')`,
      args: []
    })

    const todayListingResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM aipo_stocks WHERE date(listing_date) = date('now')`,
      args: []
    })

    const listedResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM aipo_stocks WHERE date(listing_date) < date('now')`,
      args: []
    })

    return new Response(JSON.stringify({
      success: true,
      data: {
        subscription: subscriptionResult.rows[0]?.count || 0,
        greyMarket: greyMarketResult.rows[0]?.count || 0,
        todayListing: todayListingResult.rows[0]?.count || 0,
        listed: listedResult.rows[0]?.count || 0
      }
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
