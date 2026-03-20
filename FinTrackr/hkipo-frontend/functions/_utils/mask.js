/**
 * 数据脱敏工具
 * 根据用户会员等级隐藏敏感数据
 */

/**
 * 脱敏股票数据
 * @param {Object} stock - 股票数据对象
 * @param {string} membershipLevel - 会员等级 (guest/basic/premium)
 * @returns {Object} 脱敏后的股票数据
 */
export function maskStockData(stock, membershipLevel = 'guest') {
  const masked = { ...stock }

  // 移除内部管理字段（对外网站不显示）
  delete masked.purchase_status
  delete masked.listing_status
  delete masked.sync_status
  delete masked.last_sync_at
  delete masked.internal_code

  // 付费会员才能看的字段
  if (membershipLevel !== 'premium') {
    masked.pe_ratio = null
    masked.subscription_multiple = null
    masked.lot_winning_rate = null
    masked.ai_analysis = null
    masked.recommendation = null
    masked.recommendation_score = null
  }

  return masked
}

/**
 * 批量脱敏股票数据
 * @param {Array} stocks - 股票数据数组
 * @param {string} membershipLevel - 会员等级
 * @returns {Array} 脱敏后的股票数据数组
 */
export function maskStockList(stocks, membershipLevel = 'guest') {
  return stocks.map(stock => maskStockData(stock, membershipLevel))
}
