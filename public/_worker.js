export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle sitemap.xml specifically to ensure correct headers and no HTML wrapping
    if (url.pathname === "/sitemap.xml") {
      const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://miyamoapp.com/</loc>
    <lastmod>2026-05-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.miyamoapp.com/</loc>
    <lastmod>2026-05-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

      return new Response(sitemapXML, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    // Fallback to static assets for all other routes
    return env.ASSETS.fetch(request);
  }
};
