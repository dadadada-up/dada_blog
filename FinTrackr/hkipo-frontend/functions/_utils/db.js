/**
 * Turso 数据库连接工具
 * 使用 Turso HTTP API 进行数据库操作
 */

import { createClient } from '@libsql/client/web'

/**
 * 创建 Turso 数据库客户端
 * @param {Object} env - Cloudflare Pages 环境变量
 * @returns {Object} Turso 客户端实例
 */
export function createTursoClient(env) {
  return createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN
  })
}

/**
 * 执行 SQL 查询
 * @param {Object} db - Turso 客户端
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Object>} 查询结果
 */
export async function executeQuery(db, sql, params = []) {
  try {
    const result = await db.execute({
      sql,
      args: params
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Database query error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 查询单条记录
 * @param {Object} db - Turso 客户端
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Object|null>} 查询结果
 */
export async function queryOne(db, sql, params = []) {
  const result = await executeQuery(db, sql, params)
  if (result.success && result.data.rows.length > 0) {
    return result.data.rows[0]
  }
  return null
}

/**
 * 查询多条记录
 * @param {Object} db - Turso 客户端
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果数组
 */
export async function queryMany(db, sql, params = []) {
  const result = await executeQuery(db, sql, params)
  if (result.success) {
    return result.data.rows
  }
  return []
}
