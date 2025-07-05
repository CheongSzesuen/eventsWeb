// backEnd/workers/events/submit.js
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    
    if (path !== '/api/events/submit' || request.method !== 'POST') {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const data = await request.json();
      
      // 存储到KV
      const id = `event-${Date.now()}`;
      await env.EVENTS_KV.put(id, JSON.stringify(data));
      
      return new Response(JSON.stringify({
        success: true,
        id
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: '事件提交失败'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
