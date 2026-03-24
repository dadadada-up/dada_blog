// 处理 SPA 回退和静态文件
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 微信域名验证文件
  if (pathname === '/c337d663edfed4d1d4ca927e87124acd.txt') {
    return new Response('53421c47aa6f3fc9668cc16d7ac1bd8708260ec0', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // .txt 和 .xml 文件从静态资源返回
  if (pathname.endsWith('.txt') || pathname.endsWith('.xml')) {
    try {
      // 尝试从 KV 或静态资源获取
      const staticResponse = await env.ASSETS.fetch(request);
      if (staticResponse.ok) {
        return staticResponse;
      }
    } catch (e) {
      // 继续到 fallback
    }
  }

  // 其他请求返回 SPA 入口
  return next();
}
