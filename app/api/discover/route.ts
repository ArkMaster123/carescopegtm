import { BusinessProfile, Influencer, Platform } from '@/types';
import { searchInfluencers } from '@/lib/services/brightdata';
import { getInfluencerDetails } from '@/lib/services/scrapecreators';

// Helper to extract handle from URL or string
function extractHandle(text: string, platform: Platform): string {
  if (!text) return '';
  if (platform === 'instagram') {
    const match = text.match(/instagram\.com\/([^/?]+)/);
    return match ? match[1] : text;
  }
  if (platform === 'tiktok') {
    const match = text.match(/tiktok\.com\/@([^/?]+)/);
    return match ? match[1] : text;
  }
  if (platform === 'youtube') {
    // Handle channel/UC... or @handle
    const match = text.match(/youtube\.com\/(channel\/|@)([^/?]+)/);
    return match ? match[2] : text;
  }
  return text;
}

export async function POST(req: Request) {
  try {
    const profile: BusinessProfile = await req.json();
    const keywords = profile.keywords || [];
    const industry = profile.industry || 'general';
    
    console.log(`🚀 Starting discovery for: ${profile.name} (${industry})`);

    // 1. Search for influencers using BrightData (Google Search)
    // We'll search across platforms
    const platforms: Platform[] = ['instagram', 'tiktok', 'youtube'];
    const searchPromises = platforms.map(async (platform) => {
      // Construct a query: "industry + keywords + 'influencer'"
      // e.g. "sustainable coffee influencer seattle"
      const query = `${industry} ${keywords.slice(0, 3).join(' ')} influencer`;
      return searchInfluencers(query, platform, profile.location);
    });

    const searchResults = (await Promise.all(searchPromises)).flat();
    console.log(`✨ Found ${searchResults.length} raw candidates`);

    // 2. Enrich data using ScrapeCreators
    // We'll limit to top 5 candidates per platform to save credits/time
    const enrichedInfluencers: Influencer[] = [];
    const processedHandles = new Set<string>();

    for (const result of searchResults) {
      if (enrichedInfluencers.length >= 9) break; // Hard limit for MVP

      const handle = extractHandle(result.link, result.platform);
      
      if (!handle || processedHandles.has(handle)) continue;
      processedHandles.add(handle);

      console.log(`✨ Enriching: ${handle} (${result.platform})`);
      const details = await getInfluencerDetails(handle, result.platform);

      if (details) {
        // Basic match score calculation (mock logic for now)
        // In v2, this would use AI to compare bio vs business profile
        const matchScore = Math.floor(Math.random() * (98 - 70) + 70); 

        enrichedInfluencers.push({
          ...details,
          id: handle, // use handle as ID for now
          // Fill defaults for missing fields
          engagementRate: details.engagementRate || 0,
          avgLikes: details.avgLikes || 0,
          avgComments: details.avgComments || 0,
          postFrequency: 'weekly',
          contentCategories: [industry],
          recentGrowth: 0,
          matchScore,
          matchReason: `Found via "${result.title}". Matches industry keywords.`,
        } as Influencer);
      }
    }

    return Response.json(enrichedInfluencers);
  } catch (error) {
    console.error('Discovery failed:', error);
    return Response.json({ error: 'Failed to discover influencers' }, { status: 500 });
  }
}
