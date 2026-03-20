/**
 * Cloudflare Pages Function - 获取股票AI分析
 * GET /api/aipo/admin/stocks/[stockCode]/ai-analysis
 */

import { createClient } from '@libsql/client/web'

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

    // 查询AI分析数据
    const analysisResult = await db.execute({
      sql: `SELECT 
              stock_code,
              recommendation,
              recommendation_score,
              prediction,
              strategy,
              strategy_type,
              model_version,
              created_at,
              updated_at
            FROM aipo_ai_analysis 
            WHERE stock_code = ?`,
      args: [stockCode]
    })

    if (analysisResult.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: '暂无AI分析数据'
      }), {
        status: 404,
        headers: corsHeaders
      })
    }

    const analysis = analysisResult.rows[0]

    // 解析 prediction JSON 字段
    let prediction = null
    if (analysis.prediction) {
      try {
        prediction = JSON.parse(analysis.prediction)
      } catch (e) {
        prediction = null
      }
    }

    // 获取因子配置和计算因子评分
    // 由于 Turso 中没有因子详细数据，我们从 aipo_ai_analysis 的 factors 字段获取
    // 或者返回简化版本
    
    // 尝试获取更详细的分析数据
    const detailedResult = await db.execute({
      sql: `SELECT * FROM aipo_ai_analysis WHERE stock_code = ?`,
      args: [stockCode]
    })

    let factors = []
    let reasons = []
    let similarStockCases = []
    let majorDeductions = []
    
    if (detailedResult.rows.length > 0) {
      const detailed = detailedResult.rows[0]
      
      // 解析 factors
      if (detailed.factors) {
        try {
          factors = JSON.parse(detailed.factors)
        } catch (e) {}
      }
      
      // 解析 reasons
      if (detailed.analysis_reasons) {
        try {
          reasons = JSON.parse(detailed.analysis_reasons)
        } catch (e) {}
      }
      
      // 解析 similarStockCases
      if (detailed.similar_cases) {
        try {
          similarStockCases = JSON.parse(detailed.similar_cases)
        } catch (e) {}
      }
      
      // 解析 majorDeductions
      if (detailed.major_deductions) {
        try {
          majorDeductions = JSON.parse(detailed.major_deductions)
        } catch (e) {}
      }
    }

    const responseData = {
      stockCode: analysis.stock_code,
      recommendation: analysis.recommendation,
      score: analysis.recommendation_score,
      prediction: prediction || {
        winRateMin: null,
        winRateMax: null,
        firstDayChangeMin: null,
        firstDayChangeMax: null,
        firstDayChangeExpected: null,
        suggestedLots: null,
        riskLevel: null
      },
      factors: factors,
      reasons: reasons,
      similarStockCases: similarStockCases,
      majorDeductions: majorDeductions,
      strategy: analysis.strategy,
      strategyType: analysis.strategy_type,
      modelName: analysis.model_version,
      updatedAt: analysis.updated_at
    }

    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取AI分析数据失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
