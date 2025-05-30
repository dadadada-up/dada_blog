import { Database } from 'sqlite';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

let cacheDb: Database | null = null;

// 获取缓存数据库连接
export async function getCacheDb(): Promise<Database> {
  if (cacheDb) {
    return cacheDb;
  }
  
  const dbPath = path.join(process.cwd(), 'data', 'blog-cache.db');
  
  // 确保data目录存在
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  cacheDb = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  return cacheDb;
}

// 初始化缓存数据库
export async function initializeCacheDb() {
  const db = await getCacheDb();
  
  // 创建文章表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id            INTEGER   PRIMARY KEY AUTOINCREMENT,
      slug          TEXT      UNIQUE NOT NULL,
      title         TEXT      NOT NULL,
      content       TEXT      NOT NULL,
      excerpt       TEXT,
      description   TEXT,
      published     BOOLEAN   DEFAULT true,
      featured      BOOLEAN   DEFAULT false,
      cover_image   TEXT,
      reading_time  INTEGER,
      original_file TEXT,
      created_at    DATETIME  NOT NULL,
      updated_at    DATETIME  NOT NULL
    )
  `);
  
  // 创建分类表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      slug        TEXT    UNIQUE NOT NULL,
      description TEXT
    )
  `);
  
  // 创建文章分类关联表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS post_categories (
      post_id     INTEGER NOT NULL,
      category_id TEXT    NOT NULL,
      PRIMARY KEY (post_id, category_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);
  
  // 创建标签表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      slug        TEXT    UNIQUE NOT NULL
    )
  `);
  
  // 创建文章标签关联表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id     INTEGER NOT NULL,
      tag_id      TEXT    NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);
  
  // 创建slug映射表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS slug_mapping (
      slug TEXT PRIMARY KEY,
      post_id INTEGER NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);
  
  // 创建同步状态表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sync_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_sync_time DATETIME,
      sync_in_progress BOOLEAN DEFAULT false
    )
  `);
  
  // 创建同步队列表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      operation TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      path TEXT,
      slug TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at DATETIME NOT NULL
    )
  `);
  
  // 创建必要的索引
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
  `);
}

// 初始化缓存数据库
export default async function initCacheDb() {
  await initializeCacheDb();
}

// 获取缓存数据库状态
export async function getCacheDbStatus() {
  const db = await getCacheDb();
  
  const postCount = await db.get('SELECT COUNT(*) as count FROM posts');
  const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
  const tagCount = await db.get('SELECT COUNT(*) as count FROM tags');
  const syncStatus = await db.get('SELECT * FROM sync_status WHERE id = 1');
  
  const dbFile = fs.existsSync(path.join(process.cwd(), 'data', 'blog-cache.db'));
  const dbSize = dbFile ? fs.statSync(path.join(process.cwd(), 'data', 'blog-cache.db')).size : 0;
  
  return {
    initialized: !!dbFile,
    dbSize: formatSize(dbSize),
    postCount: postCount?.count || 0,
    categoryCount: categoryCount?.count || 0,
    tagCount: tagCount?.count || 0,
    lastSyncTime: syncStatus?.last_sync_time || null,
    syncInProgress: !!syncStatus?.sync_in_progress
  };
}

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 