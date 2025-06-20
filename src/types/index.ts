export interface Post {
  id: string;
  title: string;
  category: string;
  tags: string[];
  status: string;
  author: string;
  publishDate: string | null;
  updateDate: string | null;
  originalUrl: string | null;
  content?: string;
  excerpt?: string;
  coverImage?: string; // 封面图片URL
  isFeatured?: boolean; // 是否精选文章
}

export interface Category {
  name: string;
  count: number;
}

export interface Tag {
  name: string;
  count: number;
}

// 访问统计数据类型
export interface VisitStats {
  date: string;
  count: number;
}

// 点赞统计数据类型
export interface LikeStats {
  date: string;
  count: number;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'like' | 'comment';
  postId: string;
  postTitle: string;
  createdAt: string;
  isRead: boolean;
  user?: string;
  content?: string;
}

// 推荐文章类型
export interface RecommendedPost {
  id: string;
  title: string;
  category: string;
  publishDate: string | null;
} 