/**
 * Cloudflare Pages Function - 获取 IPO 详情
 * GET /api/aipo/[stockCode]
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
  const { env, params } = context
  const stockCode = params.stockCode

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

    // 查询股票基本信息
    const stockResult = await db.execute({
      sql: 'SELECT * FROM aipo_stocks WHERE stock_code = ?',
      args: [stockCode]
    })

    if (stockResult.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: '股票不存在'
      }), {
        status: 404,
        headers: corsHeaders
      })
    }

    const stock = maskStock(stockResult.rows[0])

    // 查询公司信息（表可能不存在）
    let companyInfo = null
    try {
      const companyResult = await db.execute({
        sql: 'SELECT * FROM aipo_company_info WHERE stock_code = ?',
        args: [stockCode]
      })
      if (companyResult.rows.length > 0) {
        const c = companyResult.rows[0]
        companyInfo = {
          chairman: c.chairman,
          principalActivities: c.principal_activities,
          website: c.website,
          principalOffice: c.principal_office
        }
      }
    } catch (e) {
      console.log('aipo_company_info table not found:', e.message)
    }

    // 查询基石投资者（表可能不存在）
    let investors = []
    try {
      const investorsResult = await db.execute({
        sql: `SELECT investor_name, investor_type, investment_amount, shareholding_percentage 
              FROM aipo_investors 
              WHERE stock_code = ? 
              ORDER BY shareholding_percentage DESC`,
        args: [stockCode]
      })
      investors = investorsResult.rows.map(row => ({
        investorName: row.investor_name,
        investorType: row.investor_type,
        investmentAmount: row.investment_amount,
        shareholdingPercentage: row.shareholding_percentage
      }))
    } catch (e) {
      console.log('aipo_investors table not found:', e.message)
    }

    // 查询价格表现（表可能不存在）
    let pricePerformance = null
    try {
      const performanceResult = await db.execute({
        sql: 'SELECT * FROM aipo_price_performance WHERE stock_code = ?',
        args: [stockCode]
      })
      if (performanceResult.rows.length > 0) {
        pricePerformance = performanceResult.rows[0]
      }
    } catch (e) {
      console.log('aipo_price_performance table not found:', e.message)
    }

    // 构建返回数据
    const responseData = {
      ...stock,
      // 添加公司信息
      companyInfo: companyInfo,
      // 添加基石投资者
      investors: investors,
      // 添加价格表现数据到主对象
      greyPrice: pricePerformance?.grey_market_price || stock.grey_price,
      greyVsIssuePct: pricePerformance?.grey_vs_issue_pct,
      firstDayOpen: pricePerformance?.first_day_open,
      firstDayClose: pricePerformance?.first_day_close,
      firstDayVsIssuePct: pricePerformance?.first_day_vs_issue_pct,
      currentPrice: pricePerformance?.current_price,
      currentVsIssuePct: pricePerformance?.current_vs_issue_pct
    }

    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('IPO detail error:', error)
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
