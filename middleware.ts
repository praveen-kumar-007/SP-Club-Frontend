export const config = {
  runtime: 'edge',
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;
  
  // Extract article ID from /news/:id
  const match = pathname.match(/^\/news\/([a-f0-9]+)$/i);
  
  if (!match) {
    return fetch(request);
  }
  
  const articleId = match[1];
  
  try {
    // Fetch article data from backend
    const articleResponse = await fetch(`https://spkabaddi.me/api/news/${articleId}`);
    
    if (!articleResponse.ok) {
      return fetch(request);
    }
    
    const article = await articleResponse.json();
    
    // Determine share image
    const shareImage = article.images && article.images.length > 0
      ? (article.images[0].startsWith('http') 
          ? article.images[0] 
          : `https://spkabaddi.me${article.images[0]}`)
      : 'https://spkabaddi.me/Logo.png';
    
    // Fetch the base HTML
    const htmlResponse = await fetch(`${url.origin}/index.html`);
    const html = await htmlResponse.text();
    
    // Escape special characters for HTML attributes
    const escapeHtml = (str: string) => str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const title = escapeHtml(article.title);
    const description = escapeHtml(article.content.substring(0, 160));
    
    // Inject meta tags after <head>
    const metaTags = `
    <title>${title} - SP Kabaddi Club</title>
    <meta property="og:title" content="${title} - SP Kabaddi Club" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${shareImage}" />
    <meta property="og:image:secure_url" content="${shareImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="https://spkabaddi.me/news/${article._id}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} - SP Kabaddi Club" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${shareImage}" />
    <link rel="canonical" href="https://spkabaddi.me/news/${article._id}" />`;
    
    // Replace existing meta tags or add after <head>
    const modifiedHtml = html.replace(/<head>/, `<head>${metaTags}`);
    
    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return fetch(request);
  }
}
