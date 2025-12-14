// Vercel Edge Function to inject dynamic OG tags for news articles
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Only handle /news/* pages
  if (!pathname.startsWith('/news/')) {
    return fetch(request);
  }
  
  // Extract article ID
  const articleId = pathname.split('/news/')[1];
  
  if (!articleId || articleId.length < 20) {
    return fetch(request);
  }
  
  try {
    // Fetch the article data
    const apiResponse = await fetch(`https://spkabaddi.me/api/news/${articleId}`);
    
    if (!apiResponse.ok) {
      return fetch(request);
    }
    
    const article = await apiResponse.json();
    
    // Determine the share image
    const shareImage = article.images && article.images.length > 0
      ? (article.images[0].startsWith('http') 
          ? article.images[0] 
          : `https://spkabaddi.me${article.images[0]}`)
      : 'https://spkabaddi.me/Logo.png';
    
    // Fetch the static HTML
    const response = await fetch(`https://spkabaddi.me/index.html`);
    let html = await response.text();
    
    // Create dynamic meta tags
    const metaTags = `
    <meta property="og:title" content="${article.title.replace(/"/g, '&quot;')} - SP Kabaddi Club" />
    <meta property="og:description" content="${article.content.substring(0, 160).replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${shareImage}" />
    <meta property="og:image:secure_url" content="${shareImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="https://spkabaddi.me/news/${article._id}" />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${article.createdAt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${article.title.replace(/"/g, '&quot;')} - SP Kabaddi Club" />
    <meta name="twitter:description" content="${article.content.substring(0, 160).replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${shareImage}" />
    <title>${article.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')} - SP Kabaddi Club</title>
    `;
    
    // Replace the existing OG tags or inject after <head>
    if (html.includes('<meta property="og:title"')) {
      // Replace existing OG tags
      html = html.replace(
        /<meta property="og:title"[^>]*>[\s\S]*?<meta property="og:site_name"[^>]*>/,
        metaTags
      );
    } else {
      // Inject after <head>
      html = html.replace('<head>', '<head>' + metaTags);
    }
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
    
  } catch (error) {
    console.error('Edge function error:', error);
    return fetch(request);
  }
}
