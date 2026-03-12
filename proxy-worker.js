// GitHub Pages için Gemini API Proxy
// Cloudflare Workers veya Vercel Serverless Functions

// Cloudflare Worker kodu (worker.js)
export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const body = await request.json();
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
};
