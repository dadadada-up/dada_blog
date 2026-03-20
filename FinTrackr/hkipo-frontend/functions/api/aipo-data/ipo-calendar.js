/**
 * Cloudflare Pages Function - 新股日历
 * GET /api/aipo-data/ipo-calendar
 */

import { createTursoClient, queryMany } from '../../_utils/db.js'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

export async function onRequest(context) {
  const { env, request } = context

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    const db = createTursoClient(env)

    // 查询待上市新股（包含认购期、暗盘、上市日信息）
    // 条件：上市日期 >= start_date 且 <= end_date，或者认购期在此范围内
    const stocks = await queryMany(
      db,
      `SELECT 
        stock_code,
        stock_name,
        subscription_start,
        subscription_end,
        result_date,
        listing_date,
        price_floor,
        price_ceiling,
        issue_price,
        lot_size,
        minimum_capital,
        industry,
        sector,
        sponsor,
        underwriter,
        prospectus_url
      FROM aipo_stocks
      WHERE 
        (listing_date >= ? AND listing_date <= ?)
        OR (subscription_start >= ? AND subscription_start <= ?)
        OR (subscription_end >= ? AND subscription_end <= ?)
        OR (result_date >= ? AND result_date <= ?)
        OR (subscription_start <= ? AND subscription_end >= ?)
      ORDER BY listing_date ASC, subscription_end ASC`,
      [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate]
    )

    return new Response(JSON.stringify({
      success: true,
      data: stocks || []
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取日历数据失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
