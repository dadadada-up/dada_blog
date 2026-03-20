/**
 * Cloudflare Pages Function - 各Tab新股接口
 * GET /api/homepage/new-stocks/:tab
 */

import { createTursoClient, queryMany } from '../../../_utils/db.js'
import { maskStockList } from '../../../_utils/mask.js'

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
    isCurrentBreak: stock.is_current_break,
    principalActivities: stock.principal_activities
  }
}

/**
 * 获取认购中的新股列表
 */
async function getSubscribingStocks(db, limit, membershipLevel) {
  const stocks = await queryMany(
    db,
    `SELECT 
      s.stock_code,
      s.stock_name,
      s.industry,
      s.sector,
      s.subscription_start,
      s.subscription_end,
      s.listing_date,
      s.price_floor,
      s.price_ceiling,
      s.issue_price,
      s.lot_size,
      s.minimum_capital,
      s.hk_subscription_multiple,
      s.sponsor,
      s.underwriter,
      s.prospectus_url,
      s.green_shoe_ratio,
      s.cornerstone_investor_percentage,
      c.principal_activities
    FROM aipo_stocks s
    LEFT JOIN aipo_company_info c ON s.stock_code = c.stock_code
    WHERE date(s.subscription_start) <= date('now')
      AND date(s.subscription_end) >= date('now')
    ORDER BY s.subscription_end ASC
    LIMIT ?`,
    [limit]
  )
  
  return maskStockList(stocks, membershipLevel).map(s => formatStockData(s))
}

/**
 * 获取暗盘新股列表
 */
async function getGreyMarketStocks(db, limit, membershipLevel) {
  const stocks = await queryMany(
    db,
    `SELECT 
      s.stock_code,
      s.stock_name,
      s.industry,
      s.sector,
      s.result_date,
      s.listing_date,
      s.price_floor,
      s.price_ceiling,
      s.issue_price,
      s.lot_size,
      s.minimum_capital,
      s.sponsor,
      s.underwriter,
      s.prospectus_url,
      p.grey_market_price as grey_price,
      p.grey_vs_issue_pct
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance p ON s.stock_code = p.stock_code
    WHERE date(s.subscription_end) < date('now')
      AND date(s.listing_date) > date('now')
    ORDER BY s.listing_date ASC
    LIMIT ?`,
    [limit]
  )
  
  return maskStockList(stocks, membershipLevel).map(s => formatStockData(s))
}

/**
 * 获取今日上市新股列表
 */
async function getTodayListingStocks(db, limit, membershipLevel) {
  const stocks = await queryMany(
    db,
    `SELECT 
      s.stock_code,
      s.stock_name,
      s.industry,
      s.sector,
      s.listing_date,
      s.issue_price,
      s.lot_size,
      s.market_cap,
      s.sponsor,
      s.underwriter,
      p.first_day_open,
      p.first_day_close,
      p.first_day_vs_issue_pct
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance p ON s.stock_code = p.stock_code
    WHERE date(s.listing_date) = date('now')
    ORDER BY s.stock_code ASC
    LIMIT ?`,
    [limit]
  )
  
  return maskStockList(stocks, membershipLevel).map(s => formatStockData(s))
}

/**
 * 获取已上市新股列表
 */
async function getListedStocks(db, limit, membershipLevel) {
  const stocks = await queryMany(
    db,
    `SELECT 
      s.stock_code,
      s.stock_name,
      s.industry,
      s.sector,
      s.listing_date,
      s.issue_price,
      s.lot_size,
      s.market_cap,
      s.pe_ratio,
      s.sponsor,
      p.first_day_open,
      p.first_day_close,
      p.current_price,
      p.first_day_vs_issue_pct,
      p.current_vs_issue_pct,
      p.is_first_day_break,
      p.is_current_break
    FROM aipo_stocks s
    LEFT JOIN aipo_price_performance p ON s.stock_code = p.stock_code
    WHERE date(s.listing_date) <= date('now')
    ORDER BY s.listing_date DESC
    LIMIT ?`,
    [limit]
  )
  
  return maskStockList(stocks, membershipLevel).map(s => formatStockData(s))
}

export async function onRequest(context) {
  const { env, request, params } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const tab = params.tab
  
  const validTabs = ['subscribing', 'greyMarket', 'todayListing', 'listed']
  if (!validTabs.includes(tab)) {
    return new Response(JSON.stringify({
      success: false,
      message: `无效的tab参数，可选值: ${validTabs.join(', ')}`
    }), {
      status: 400,
      headers: corsHeaders
    })
  }

  try {
    const db = createTursoClient(env)
    const membershipLevel = 'guest'

    let stocks = []
    switch (tab) {
      case 'subscribing':
        stocks = await getSubscribingStocks(db, limit, membershipLevel)
        break
      case 'greyMarket':
        stocks = await getGreyMarketStocks(db, limit, membershipLevel)
        break
      case 'todayListing':
        stocks = await getTodayListingStocks(db, limit, membershipLevel)
        break
      case 'listed':
        stocks = await getListedStocks(db, limit, membershipLevel)
        break
    }

    return new Response(JSON.stringify({
      success: true,
      data: stocks,
      total: stocks.length
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error(`Error fetching ${tab} stocks:`, error)
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
