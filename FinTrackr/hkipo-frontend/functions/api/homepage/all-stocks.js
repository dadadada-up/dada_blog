/**
 * Cloudflare Pages Function - 全部新股列表接口
 * GET /api/homepage/all-stocks
 */

import { createTursoClient, queryMany, queryOne } from '../../_utils/db.js'
import { maskStockList } from '../../_utils/mask.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

/**
 * 格式化股票数据
 */
function formatStockData(stock) {
  if (!stock) return null
  
  return {
    stockCode: stock.stock_code,
    stockName: stock.stock_name,
    industry: stock.industry,
    sector: stock.sector,
    subscriptionStart: stock.subscription_start,
    subscriptionEnd: stock.subscription_end,
    listingDate: stock.listing_date,
    resultDate: stock.result_date,
    priceFloor: stock.price_floor,
    priceCeiling: stock.price_ceiling,
    issuePrice: stock.issue_price,
    lotSize: stock.lot_size,
    minimumCapital: stock.minimum_capital,
    marketCap: stock.market_cap,
    peRatio: stock.pe_ratio,
    hkSubscriptionMultiple: stock.hk_subscription_multiple,
    sponsor: stock.sponsor,
    underwriter: stock.underwriter,
    prospectusUrl: stock.prospectus_url,
    greenShoeRatio: stock.green_shoe_ratio,
    cornerstoneInvestorPercentage: stock.cornerstone_investor_percentage,
    greyPrice: stock.grey_price || stock.grey_market_price,
    greyVsIssuePct: stock.grey_vs_issue_pct,
    firstDayOpen: stock.first_day_open,
    firstDayClose: stock.first_day_close,
    firstDayVsIssuePct: stock.first_day_vs_issue_pct,
    currentPrice: stock.current_price,
    currentVsIssuePct: stock.current_vs_issue_pct,
    isFirstDayBreak: stock.is_first_day_break,
    isCurrentBreak: stock.is_current_break
  }
}

export async function onRequest(context) {
  const { env, request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const industry = url.searchParams.get('industry')
  const sector = url.searchParams.get('sector')
  const search = url.searchParams.get('search')
  const sortBy = url.searchParams.get('sortBy') || 'date'
  const sortDir = url.searchParams.get('sortDir') || 'desc'
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
  const offset = (page - 1) * pageSize

  try {
    const db = createTursoClient(env)
    const membershipLevel = 'guest'

    // 构建基础SQL
    let sql = `
      SELECT 
        s.*,
        p.grey_market_price as grey_price,
        p.grey_vs_issue_pct,
        p.first_day_open,
        p.first_day_close,
        p.current_price,
        p.first_day_vs_issue_pct,
        p.current_vs_issue_pct,
        p.is_first_day_break,
        p.is_current_break
      FROM aipo_stocks s
      LEFT JOIN aipo_price_performance p ON s.stock_code = p.stock_code
      WHERE 1=1
    `

    const params = []

    // 状态筛选
    if (status) {
      switch (status) {
        case 'subscribing':
          sql += ` AND date(s.subscription_start) <= date('now')
                   AND date(s.subscription_end) >= date('now')`
          break
        case 'darkpool':
          sql += ` AND date(s.result_date) >= date('now')
                   AND date(s.result_date) <= date('now', '+3 days')`
          break
        case 'listing':
          sql += ` AND date(s.listing_date) = date('now')`
          break
        case 'listed':
          sql += ` AND date(s.listing_date) <= date('now')`
          break
      }
    }

    // 行业筛选
    if (industry) {
      sql += ' AND s.industry = ?'
      params.push(industry)
    }

    // 板块筛选
    if (sector) {
      sql += ' AND s.sector = ?'
      params.push(sector)
    }

    // 搜索
    if (search) {
      sql += ' AND (s.stock_code LIKE ? OR s.stock_name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 排序
    let orderClause = ''
    switch (sortBy) {
      case 'date':
        orderClause = `ORDER BY s.listing_date ${sortDir.toUpperCase()}`
        break
      case 'multiple':
        orderClause = `ORDER BY s.hk_subscription_multiple ${sortDir.toUpperCase()}`
        break
      default:
        orderClause = `ORDER BY s.listing_date DESC`
    }
    
    sql += ` ${orderClause}`

    // 分页
    sql += ' LIMIT ? OFFSET ?'
    params.push(pageSize, offset)

    const stocks = await queryMany(db, sql, params)
    const maskedStocks = maskStockList(stocks, membershipLevel)

    // 获取总数
    let countSql = `SELECT COUNT(*) as total FROM aipo_stocks s WHERE 1=1`
    const countParams = []

    if (status) {
      switch (status) {
        case 'subscribing':
          countSql += ` AND date(s.subscription_start) <= date('now')
                       AND date(s.subscription_end) >= date('now')`
          break
        case 'darkpool':
          countSql += ` AND date(s.result_date) >= date('now')
                       AND date(s.result_date) <= date('now', '+3 days')`
          break
        case 'listing':
          countSql += ` AND date(s.listing_date) = date('now')`
          break
        case 'listed':
          countSql += ` AND date(s.listing_date) <= date('now')`
          break
      }
    }
    if (industry) {
      countSql += ' AND s.industry = ?'
      countParams.push(industry)
    }
    if (sector) {
      countSql += ' AND s.sector = ?'
      countParams.push(sector)
    }
    if (search) {
      countSql += ' AND (s.stock_code LIKE ? OR s.stock_name LIKE ?)'
      countParams.push(`%${search}%`, `%${search}%`)
    }
    
    const countResult = await queryOne(db, countSql, countParams)

    return new Response(JSON.stringify({
      success: true,
      data: maskedStocks.map(s => formatStockData(s)),
      pagination: {
        page,
        pageSize,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / pageSize)
      }
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Error fetching all stocks:', error)
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
