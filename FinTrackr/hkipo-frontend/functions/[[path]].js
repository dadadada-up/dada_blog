// 处理微信域名验证和 SPA 路由
export async function onRequest(context) {
  const { request, env } = context;
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

  // 其他 .txt 文件尝试从静态资源获取
  if (pathname.endsWith('.txt') || pathname.endsWith('.xml')) {
    try {
      const assetUrl = new URL(url.pathname, url.origin);
      const assetResponse = await env.ASSETS.fetch(assetUrl);
      if (assetResponse.ok) {
        return assetResponse;
      }
    } catch (e) {
      console.error('Asset fetch error:', e);
    }
  }

  // 其他请求返回 index.html (SPA)
  try {
    const indexUrl = new URL('/index.html', url.origin);
    const indexResponse = await env.ASSETS.fetch(indexUrl);
    return new Response(indexResponse.body, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (e) {
    return new Response('Error loading page', { status: 500 });
  }
}