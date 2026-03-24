// 微信域名验证文件
export async function onRequest() {
  return new Response('53421c47aa6f3fc9668cc16d7ac1bd8708260ec0', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}
