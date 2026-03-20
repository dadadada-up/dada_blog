/**
 * 年度统计 API
 * GET /api/aipo/stats/yearly
 */

import { createClient } from '@libsql/client/web'

export async function onRequestGet(context) {
  try {
    const { env } = context
    
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    })

    // 查询年度统计数据
    const result = await db.execute(`
      SELECT 
        strftime('%Y', s.listing_date) as year,
        COUNT(*) as total_count,
        SUM(CASE WHEN p.first_day_vs_issue_pct > 0 THEN 1 ELSE 0 END) as rise_count,
        AVG(CASE WHEN p.first_day_vs_issue_pct > 0 THEN p.first_day_vs_issue_pct END) as avg_rise_pct,
        SUM(CASE WHEN p.first_day_vs_issue_pct < 0 THEN 1 ELSE 0 END) as fall_count,
        AVG(CASE WHEN p.first_day_vs_issue_pct < 0 THEN p.first_day_vs_issue_pct END) as avg_fall_pct,
        SUM(CASE WHEN p.first_day_vs_issue_pct = 0 OR p.first_day_vs_issue_pct IS NULL THEN 1 ELSE 0 END) as flat_count
      FROM aipo_stocks s
      LEFT JOIN aipo_price_performance p ON s.stock_code = p.stock_code
      WHERE s.listing_date IS NOT NULL 
        AND s.listing_date <= date('now')
        AND s.listing_date >= '2020-01-01'
      GROUP BY strftime('%Y', s.listing_date)
      ORDER BY year DESC
    `)

    // 处理数据格式
    const data = result.rows.map(row => ({
      year: row.year,
      total_count: row.total_count,
      rise_count: row.rise_count || 0,
      avg_rise_pct: row.avg_rise_pct || null,
      fall_count: row.fall_count || 0,
      avg_fall_pct: row.avg_fall_pct || null,
      flat_count: row.flat_count || 0
    }))

    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Yearly stats error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取年度统计数据失败',
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
