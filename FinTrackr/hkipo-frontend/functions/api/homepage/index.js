/**
 * Cloudflare Pages Function - 首页聚合接口
 * GET /api/homepage
 */

import { createTursoClient, queryOne, queryMany } from '../../_utils/db.js'
import { maskStockList } from '../../_utils/mask.js'

// CORS headers
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
 * 获取统计数据
 */
async function getStats(db) {
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

  return {
    subscription: subscriptionCount?.count || 0,
    greyMarket: greyMarketCount?.count || 0,
    todayListing: todayListingCount?.count || 0,
    listed: listedCount?.count || 0
  }
}

/**
 * 获取认购中的新股列表
 */
async function getSubscribingStocks(db, limit = 10, membershipLevel = 'guest') {
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
  
  const maskedStocks = maskStockList(stocks, membershipLevel)
  return maskedStocks.map(s => formatStockData(s))
}

/**
 * 获取暗盘新股列表
 */
async function getGreyMarketStocks(db, limit = 10, membershipLevel = 'guest') {
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
  
  const maskedStocks = maskStockList(stocks, membershipLevel)
  return maskedStocks.map(s => formatStockData(s))
}

/**
 * 获取今日上市新股列表
 */
async function getTodayListingStocks(db, limit = 10, membershipLevel = 'guest') {
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
  
  const maskedStocks = maskStockList(stocks, membershipLevel)
  return maskedStocks.map(s => formatStockData(s))
}

/**
 * 获取已上市新股列表
 */
async function getListedStocks(db, limit = 10, membershipLevel = 'guest') {
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
  
  const maskedStocks = maskStockList(stocks, membershipLevel)
  return maskedStocks.map(s => formatStockData(s))
}

/**
 * 获取最新分析文章
 */
async function getLatestArticles(db, limit = 5) {
  try {
    const wechatArticles = await queryMany(
      db,
      `SELECT 
        id as article_id,
        title,
        summary,
        url,
        cover_image,
        author,
        published_at,
        'wechat' as source
      FROM wechat_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT ?`,
      [limit]
    )
    
    if (wechatArticles && wechatArticles.length > 0) {
      return wechatArticles.map(a => ({
        articleId: a.article_id,
        title: a.title,
        summary: a.summary,
        url: a.url,
        coverImage: a.cover_image,
        author: a.author || 'Z掌柜',
        publishedAt: a.published_at,
        source: 'wechat'
      }))
    }

    const articles = await queryMany(
      db,
      `SELECT 
        article_id,
        title,
        summary,
        cover_image,
        author,
        created_at,
        stock_code
      FROM articles
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT ?`,
      [limit]
    )
    
    return articles.map(a => ({
      articleId: a.article_id,
      title: a.title,
      summary: a.summary,
      coverImage: a.cover_image,
      author: a.author || 'Z掌柜',
      publishedAt: a.created_at,
      stockCode: a.stock_code,
      source: 'local'
    }))
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    return []
  }
}

export async function onRequest(context) {
  const { env, request } = context

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const db = createTursoClient(env)
    const membershipLevel = 'guest' // 公开API，默认guest

    // 并行获取所有数据
    const [
      stats,
      subscribingStocks,
      greyMarketStocks,
      todayListingStocks,
      listedStocks,
      latestArticles
    ] = await Promise.all([
      getStats(db),
      getSubscribingStocks(db, 10, membershipLevel),
      getGreyMarketStocks(db, 10, membershipLevel),
      getTodayListingStocks(db, 10, membershipLevel),
      getListedStocks(db, 10, membershipLevel),
      getLatestArticles(db, 5)
    ])

    return new Response(JSON.stringify({
      success: true,
      data: {
        stats,
        newStockCenter: {
          subscribing: subscribingStocks,
          greyMarket: greyMarketStocks,
          todayListing: todayListingStocks,
          listed: listedStocks
        },
        latestArticles
      }
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取首页数据失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
