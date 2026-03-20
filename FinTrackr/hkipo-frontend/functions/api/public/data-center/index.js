/**
 * 数据中心 API
 * 提供数据中心页面的统计数据
 */

import { createTursoClient } from '../../../_utils/db'

/**
 * 格式化数值为百分比字符串
 */
function formatPercent(value) {
  if (value === null || value === undefined) return '-'
  const num = parseFloat(value)
  if (isNaN(num)) return '-'
  return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
}

/**
 * 格式化倍数
 */
function formatMultiple(value) {
  if (value === null || value === undefined) return '-'
  const num = parseFloat(value)
  if (isNaN(num)) return '-'
  return `${num.toFixed(1)}倍`
}

/**
 * 格式化中签率
 */
function formatRate(value) {
  if (value === null || value === undefined) return '-'
  const num = parseFloat(value)
  if (isNaN(num)) return '-'
  return `${num.toFixed(1)}%`
}

/**
 * 获取核心统计数据
 */
async function getOverview(db, year) {
  const result = await db.execute({
    sql: `SELECT 
      COUNT(DISTINCT s.stock_code) as total_count,
      AVG(pp.first_day_vs_issue_pct) as avg_first_day_change,
      AVG(s.hk_subscription_multiple) as avg_subscription,
      AVG(s.lot_winning_rate) as avg_winning_rate
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance pp ON s.stock_code = pp.stock_code
    WHERE strftime('%Y', s.listing_date) = ?
      AND s.listing_status = '已上市'`,
    args: [year.toString()]
  })

  const stats = result.rows[0] || {}
  return {
    totalIPO: stats.total_count || 0,
    avgFirstDayChange: formatPercent(stats.avg_first_day_change),
    avgSubscription: formatMultiple(stats.avg_subscription),
    avgWinningRate: formatRate(stats.avg_winning_rate)
  }
}

/**
 * 获取首日表现数据
 */
async function getPerformance(db, year) {
  // 分布统计
  const distResult = await db.execute({
    sql: `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN pp.first_day_vs_issue_pct < 0 THEN 1 ELSE 0 END) as down_count,
      SUM(CASE WHEN pp.first_day_vs_issue_pct = 0 OR pp.first_day_vs_issue_pct IS NULL THEN 1 ELSE 0 END) as flat_count,
      SUM(CASE WHEN pp.first_day_vs_issue_pct > 0 THEN 1 ELSE 0 END) as up_count
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance pp ON s.stock_code = pp.stock_code
    WHERE strftime('%Y', s.listing_date) = ?
      AND s.listing_status = '已上市'`,
    args: [year.toString()]
  })

  const dist = distResult.rows[0] || {}
  const total = dist.total || 1

  // 涨幅榜
  const gainersResult = await db.execute({
    sql: `SELECT s.stock_name, pp.first_day_vs_issue_pct
    FROM aipo_stocks s
    JOIN aipo_price_performance pp ON s.stock_code = pp.stock_code
    WHERE strftime('%Y', s.listing_date) = ? 
      AND pp.first_day_vs_issue_pct IS NOT NULL
      AND s.listing_status = '已上市'
    ORDER BY pp.first_day_vs_issue_pct DESC
    LIMIT 10`,
    args: [year.toString()]
  })

  // 跌幅榜
  const losersResult = await db.execute({
    sql: `SELECT s.stock_name, pp.first_day_vs_issue_pct
    FROM aipo_stocks s
    JOIN aipo_price_performance pp ON s.stock_code = pp.stock_code
    WHERE strftime('%Y', s.listing_date) = ? 
      AND pp.first_day_vs_issue_pct IS NOT NULL
      AND s.listing_status = '已上市'
    ORDER BY pp.first_day_vs_issue_pct ASC
    LIMIT 10`,
    args: [year.toString()]
  })

  return {
    downCount: dist.down_count || 0,
    flatCount: dist.flat_count || 0,
    upCount: dist.up_count || 0,
    downPct: ((dist.down_count || 0) / total * 100).toFixed(1),
    flatPct: ((dist.flat_count || 0) / total * 100).toFixed(1),
    upPct: ((dist.up_count || 0) / total * 100).toFixed(1),
    topGainers: gainersResult.rows.map(r => ({
      name: r.stock_name,
      change: formatPercent(r.first_day_vs_issue_pct)
    })),
    topLosers: losersResult.rows.map(r => ({
      name: r.stock_name,
      change: `${parseFloat(r.first_day_vs_issue_pct).toFixed(1)}%`
    }))
  }
}

/**
 * 获取认购统计数据
 */
async function getSubscription(db, year) {
  // 获取所有认购数据
  const stocksResult = await db.execute({
    sql: `SELECT hk_subscription_multiple FROM aipo_stocks 
    WHERE strftime('%Y', listing_date) = ? 
      AND hk_subscription_multiple IS NOT NULL
      AND listing_status = '已上市'`,
    args: [year.toString()]
  })

  const distribution = [
    { range: '<10倍', count: 0, pct: 0 },
    { range: '10-50倍', count: 0, pct: 0 },
    { range: '50-100倍', count: 0, pct: 0 },
    { range: '100-500倍', count: 0, pct: 0 },
    { range: '>500倍', count: 0, pct: 0 }
  ]

  const total = stocksResult.rows.length || 1
  stocksResult.rows.forEach(r => {
    const multiple = r.hk_subscription_multiple || 0
    if (multiple < 10) distribution[0].count++
    else if (multiple < 50) distribution[1].count++
    else if (multiple < 100) distribution[2].count++
    else if (multiple < 500) distribution[3].count++
    else distribution[4].count++
  })

  distribution.forEach(d => {
    d.pct = (d.count / total * 100).toFixed(1)
  })

  // 热门新股
  const topResult = await db.execute({
    sql: `SELECT stock_name, hk_subscription_multiple, lot_winning_rate
    FROM aipo_stocks 
    WHERE strftime('%Y', listing_date) = ? 
      AND hk_subscription_multiple IS NOT NULL
      AND listing_status = '已上市'
    ORDER BY hk_subscription_multiple DESC
    LIMIT 10`,
    args: [year.toString()]
  })

  return {
    distribution,
    topStocks: topResult.rows.map(r => ({
      name: r.stock_name,
      multiple: r.hk_subscription_multiple ? `${Math.round(r.hk_subscription_multiple)}倍` : '-',
      rate: formatRate(r.lot_winning_rate),
      applicants: '-'
    }))
  }
}

/**
 * 获取保荐人数据
 */
async function getSponsor(db, year) {
  const result = await db.execute({
    sql: `SELECT 
      s.sponsor,
      COUNT(*) as project_count,
      AVG(pp.first_day_vs_issue_pct) as avg_change,
      SUM(CASE WHEN pp.first_day_vs_issue_pct < 0 THEN 1 ELSE 0 END) as break_count
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance pp ON s.stock_code = pp.stock_code
    WHERE strftime('%Y', s.listing_date) = ? 
      AND s.sponsor IS NOT NULL 
      AND s.sponsor != ''
      AND s.listing_status = '已上市'
    GROUP BY s.sponsor
    HAVING project_count >= 1
    ORDER BY project_count DESC
    LIMIT 20`,
    args: [year.toString()]
  })

  return {
    list: result.rows.map(r => {
      const avgChange = r.avg_change || 0
      const breakRate = (r.break_count || 0) / r.project_count * 100

      // 计算推荐指数
      let rating = 3
      if (avgChange > 20 && breakRate < 10) rating = 5
      else if (avgChange > 15 && breakRate < 15) rating = 4
      else if (avgChange > 10 && breakRate < 20) rating = 4
      else if (avgChange > 5 && breakRate < 25) rating = 3
      else if (avgChange > 0 && breakRate < 30) rating = 2
      else rating = 1

      return {
        name: r.sponsor,
        count: r.project_count,
        avgChange: formatPercent(avgChange),
        breakRate: `${breakRate.toFixed(1)}%`,
        rating
      }
    })
  }
}

/**
 * 获取行业分布数据
 */
async function getIndustry(db, year) {
  const result = await db.execute({
    sql: `SELECT 
      s.industry,
      COUNT(*) as count,
      AVG(pp.first_day_vs_issue_pct) as avg_change
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance pp ON s.stock_code = pp.stock_code
    WHERE strftime('%Y', s.listing_date) = ? 
      AND s.industry IS NOT NULL 
      AND s.industry != ''
      AND s.listing_status = '已上市'
    GROUP BY s.industry
    ORDER BY count DESC`,
    args: [year.toString()]
  })

  const total = result.rows.reduce((sum, r) => sum + r.count, 0) || 1

  return {
    distribution: result.rows.map(r => ({
      name: r.industry,
      count: r.count,
      pct: (r.count / total * 100).toFixed(1)
    })),
    avgChange: result.rows.map(r => ({
      name: r.industry,
      change: formatPercent(r.avg_change)
    }))
  }
}

/**
 * 获取股票选项（用于计算器）
 */
async function getStocks(db, year) {
  const result = await db.execute({
    sql: `SELECT 
      stock_code, 
      stock_name, 
      lot_winning_rate,
      issue_price,
      hk_subscription_multiple
    FROM aipo_stocks 
    WHERE strftime('%Y', listing_date) = ?
      AND lot_winning_rate IS NOT NULL
      AND listing_status = '已上市'
    ORDER BY listing_date DESC
    LIMIT 100`,
    args: [year.toString()]
  })

  return result.rows.map(r => ({
    code: r.stock_code,
    name: r.stock_name,
    winningRate: r.lot_winning_rate,
    issuePrice: r.issue_price,
    subscriptionMultiple: r.hk_subscription_multiple
  }))
}

/**
 * 主处理函数
 */
export async function onRequestGet(context) {
  try {
    const { env } = context
    const url = new URL(context.request.url)
    const year = url.searchParams.get('year') || new Date().getFullYear()

    const db = createTursoClient(env)

    // 并行获取所有数据
    const [stats, performance, subscription, sponsor, industry, stocks] = await Promise.all([
      getOverview(db, year),
      getPerformance(db, year),
      getSubscription(db, year),
      getSponsor(db, year),
      getIndustry(db, year),
      getStocks(db, year)
    ])

    return new Response(JSON.stringify({
      success: true,
      data: {
        stats,
        performance,
        subscription,
        sponsor,
        industry,
        stocks
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Data center API error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取数据失败',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
