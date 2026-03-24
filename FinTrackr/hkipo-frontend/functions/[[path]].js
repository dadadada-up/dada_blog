// 处理静态文件和 SPA 路由
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 微信域名验证文件 - 直接返回验证内容
  if (pathname === '/c337d663edfed4d1d4ca927e87124acd.txt') {
    return new Response('53421c47aa6f3fc9668cc16d7ac1bd8708260ec0', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // 其他请求继续到下一个处理器
  return next();
}
