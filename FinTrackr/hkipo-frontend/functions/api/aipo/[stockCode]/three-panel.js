/**
 * Cloudflare Pages Function - 获取三盘面分析数据
 * GET /api/aipo/[stockCode]/three-panel
 */

import { createClient } from '@libsql/client/web'

// 三盘面映射配置
const panelMapping = {
  '基本面': {
    description: '赚「估值差价」的钱',
    factorTypes: ['发行质量', '规模估值', '行业因素', '财务情况']
  },
  '情绪面': {
    description: '看「市场热度」',
    factorTypes: ['市场情绪', '大盘走势', '板块热度', '新股效应', '跨市场']
  },
  '筹码面': {
    description: '决定涨跌动力',
    factorTypes: ['市场热度', '基石背书', '机构质量']
  }
}

// 根据分数获取等级
function getLevelFromScore(score) {
  if (score >= 8) return '优秀'
  if (score >= 6) return '良好'
  if (score >= 4) return '一般'
  if (score >= 2) return '较差'
  return '很差'
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

    // 获取股票基本信息
    const stockResult = await db.execute({
      sql: 'SELECT stock_code, stock_name FROM aipo_stocks WHERE stock_code = ?',
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

    const stock = stockResult.rows[0]

    // 获取AI分析数据
    const analysisResult = await db.execute({
      sql: `SELECT recommendation, recommendation_score, factors, prediction 
            FROM aipo_ai_analysis 
            WHERE stock_code = ?`,
      args: [stockCode]
    })

    if (analysisResult.rows.length === 0 || !analysisResult.rows[0].factors) {
      return new Response(JSON.stringify({
        success: false,
        message: '暂无三盘面分析数据'
      }), {
        status: 404,
        headers: corsHeaders
      })
    }

    const analysis = analysisResult.rows[0]
    
    // 解析 factors JSON
    let factors = []
    try {
      factors = JSON.parse(analysis.factors)
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        message: '因子数据解析失败'
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    // 构建三盘面数据
    const panels = []
    let totalScore = 0
    let totalWeight = 0

    for (const [panelName, config] of Object.entries(panelMapping)) {
      const panelFactors = factors.filter(f => config.factorTypes.includes(f.name))
      
      if (panelFactors.length === 0) continue

      let panelWeightedScore = 0
      let panelTotalWeight = 0

      const factorTypes = panelFactors.map(f => {
        const weight = f.weight || 0
        const score = f.score || 0
        const maxScore = f.maxScore || 0
        const scoreRate = f.scoreRate || (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0)
        const typeScore = scoreRate / 10

        panelWeightedScore += typeScore * weight
        panelTotalWeight += weight

        return {
          typeName: f.name,
          typeWeight: weight / 100,
          typeScore: typeScore,
          typeLevel: getLevelFromScore(typeScore),
          typeSummary: f.deductionReason || '',
          factors: []
        }
      })

      const panelScore = panelTotalWeight > 0 ? panelWeightedScore / panelTotalWeight : 0

      panels.push({
        panelName,
        panelDescription: config.description,
        panelScore: Math.round(panelScore * 10) / 10,
        panelLevel: getLevelFromScore(panelScore),
        panelWeight: panelTotalWeight,
        factorTypes
      })

      totalScore += panelScore * panelTotalWeight
      totalWeight += panelTotalWeight
    }

    // 计算综合盘面指数
    const panMianIndex = totalWeight > 0 ? totalScore / totalWeight : 0

    const responseData = {
      stockCode: stock.stock_code,
      stockName: stock.stock_name,
      panMianIndex: Math.round(panMianIndex * 10) / 10,
      panMianLevel: getLevelFromScore(panMianIndex),
      panels,
      totalScore: analysis.recommendation_score,
      generatedAt: new Date().toISOString()
    }

    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Three panel analysis error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: '获取三盘面分析失败',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
