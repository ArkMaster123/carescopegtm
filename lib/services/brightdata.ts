import { Platform } from '@/types';

interface SearchResult {
  link: string;
  title: string;
  snippet: string;
  platform: Platform;
}

export async function searchInfluencers(query: string, platform: Platform, location: string = 'us'): Promise<SearchResult[]> {
  const apiKey = process.env.BRIGHTDATA_API_KEY;
  const zone = process.env.BRIGHTDATA_ZONE;

  if (!apiKey || !zone) {
    console.error('Missing BrightData credentials');
    return [];
  }

  const siteOperator = platform === 'instagram' ? 'site:instagram.com' : 
                      platform === 'tiktok' ? 'site:tiktok.com' : 
                      'site:youtube.com';

  const fullQuery = `${siteOperator} ${query}`;
  // Map common location names to Google 'gl' codes if possible, or just default to 'us'
  // This is a basic mapping. In a real app, use a library or more extensive map.
  const countryCode = location.toLowerCase() === 'uk' || location.toLowerCase() === 'united kingdom' ? 'uk' :
                      location.toLowerCase() === 'australia' ? 'au' :
                      location.toLowerCase() === 'canada' ? 'ca' :
                      'us'; // default

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}&num=10&hl=en&gl=${countryCode}`;

  try {
    console.log(`🔍 Searching BrightData: ${fullQuery}`);
    
    // BrightData SERP API expects 'brd_json' as a query parameter in the URL for the target request,
    // OR 'data_format': 'json' in the body if using their specific structure.
    // Based on error "brd_json is not allowed" in body, we should move it or use format.
    // Docs say: "format": "raw" returns the raw HTML/JSON from the target.
    // But we want BrightData to parse it.
    // Let's try using 'data_format': 'json' instead of 'brd_json' in body, or appending to URL.
    
    // Re-reading the docs/examples provided earlier:
    // curl ... -d '{"zone": "...", "url": "...", "format": "raw"}' ...
    // "Prefer JSON output? Set query parameter “brd_json=1” to receive JSON SERP structure."
    // This likely means the TARGET URL needs brd_json=1, NOT the BrightData API body.
    
    // Let's append &brd_json=1 to the searchUrl itself.
    const searchUrlWithParam = `${searchUrl}&brd_json=1`;

    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zone: zone,
        url: searchUrlWithParam,
        format: 'raw', 
      })
    });

    if (!response.ok) {
      console.error(`BrightData API Error: ${response.statusText}`);
      const text = await response.text();
      console.error('Error details:', text);
      return [];
    }

    const data = await response.json();
    
    // Parse BrightData JSON response
    // Structure is usually { organic: [ { link, title, description, ... } ] }
    const results = data.organic || [];
    
    return results.map((result: { link: string; title: string; description: string }) => ({
      link: result.link,
      title: result.title,
      snippet: result.description,
      platform
    })).filter((r: SearchResult) => r.link && (r.link.includes('/p/') === false && r.link.includes('/reel/') === false)); // basic filter for posts vs profiles

  } catch (error) {
    console.error('BrightData Search Failed:', error);
    return [];
  }
}
