/**
 * Cloudflare Pages Function - 统计数据接口
 * GET /api/homepage/stats
 */

import { createTursoClient, queryOne } from '../../_utils/db.js'

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

  try {
    const db = createTursoClient(env)

    const subscriptionCount = await queryOne(
      db,
      `SELECT COUNT(*) as count FROM aipo_stocks
       WHERE date(subscription_start) <= date('now') 
       AND date(subscription_end) >= date('now')`
    )

    const greyMarketCount = await queryOne(
      db,
      `SELECT COUNT(*) as count FROM aipo_stocks
       WHERE date(subscription_end) < date('now')
       AND date(listing_date) > date('now')`
    )

    const todayListingCount = await queryOne(
      db,
      `SELECT COUNT(*) as count FROM aipo_stocks
       WHERE date(listing_date) = date('now')`
    )

    const listedCount = await queryOne(
      db,
      `SELECT COUNT(*) as count FROM aipo_stocks
       WHERE date(listing_date) < date('now')`
    )

    return new Response(JSON.stringify({
      success: true,
      data: {
        subscription: subscriptionCount?.count || 0,
        greyMarket: greyMarketCount?.count || 0,
        todayListing: todayListingCount?.count || 0,
        listed: listedCount?.count || 0
      }
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
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
