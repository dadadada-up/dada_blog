'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // 初始化加载点赞状态
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 获取全局点赞数据
    const likesData = localStorage.getItem('blog-likes') || '{}';
    const likesMap = JSON.parse(likesData);
    
    // 获取当前文章点赞数
    const postLikes = parseInt(likesMap[postId] || '0', 10);
    setLikes(postLikes);
    
    // 检查用户是否已点赞
    const likedPosts = localStorage.getItem('blog-liked-posts') || '[]';
    const likedPostsArray = JSON.parse(likedPosts);
    setHasLiked(likedPostsArray.includes(postId));
  }, [postId]);

  // 处理点赞
  const handleLike = () => {
    if (typeof window === 'undefined') return;

    // 如果已点赞，取消点赞
    if (hasLiked) {
      // 更新点赞数
      const newLikes = Math.max(0, likes - 1);
      setLikes(newLikes);
      
      // 更新全局点赞数据
      const likesData = localStorage.getItem('blog-likes') || '{}';
      const likesMap = JSON.parse(likesData);
      likesMap[postId] = newLikes;
      localStorage.setItem('blog-likes', JSON.stringify(likesMap));
      
      // 从已点赞列表中移除
      const likedPosts = localStorage.getItem('blog-liked-posts') || '[]';
      const likedPostsArray = JSON.parse(likedPosts);
      const updatedLikedPosts = likedPostsArray.filter((id: string) => id !== postId);
      localStorage.setItem('blog-liked-posts', JSON.stringify(updatedLikedPosts));
      
      setHasLiked(false);
    } else {
      // 增加点赞
      const newLikes = likes + 1;
      setLikes(newLikes);
      
      // 更新全局点赞数据
      const likesData = localStorage.getItem('blog-likes') || '{}';
      const likesMap = JSON.parse(likesData);
      likesMap[postId] = newLikes;
      localStorage.setItem('blog-likes', JSON.stringify(likesMap));
      
      // 添加到已点赞列表
      const likedPosts = localStorage.getItem('blog-liked-posts') || '[]';
      const likedPostsArray = JSON.parse(likedPosts);
      likedPostsArray.push(postId);
      localStorage.setItem('blog-liked-posts', JSON.stringify(likedPostsArray));
      
      setHasLiked(true);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
    >
      {hasLiked ? (
        <FaHeart className="text-red-500" />
      ) : (
        <FaRegHeart />
      )}
      <span>{likes}</span>
    </button>
  );
} 