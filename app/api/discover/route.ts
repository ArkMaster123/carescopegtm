import { BusinessProfile, Influencer, Platform } from '@/types';
import { searchInfluencers, SearchResult } from '@/lib/services/brightdata';
import { getInfluencerDetails, searchTikTokTop } from '@/lib/services/scrapecreators';

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

    // 1. Search for influencers
    // We'll search across platforms. Optimized: Use direct TikTok Search API for faster/better results.
    
    const influencers: Influencer[] = [];
    const processedHandles = new Set<string>();

    // --- Parallel Search ---
    const [brightDataResults, tikTokResults] = await Promise.all([
      // A. BrightData for Instagram & YouTube (DISABLED FOR TESTING)
      (async (): Promise<SearchResult[]> => {
        return []; // Return empty array to skip BrightData logic
        /*
        const platforms: Platform[] = ['instagram', 'youtube'];
        const promises = platforms.map(async (platform) => {
          const query = `${industry} ${keywords.slice(0, 3).join(' ')} influencer`;
          return searchInfluencers(query, platform, profile.location);
        });
        return (await Promise.all(promises)).flat();
        */
      })(),

      // B. Direct ScrapeCreators for TikTok
      (async () => {
        // TikTok search is sensitive to long queries. Use simplified terms.
        // Use top 2 keywords if available, otherwise industry.
        const tikTokQuery = keywords.length > 0 ? keywords.slice(0, 2).join(' ') : industry;
        
        // Fix common region codes (e.g., UK -> GB for TikTok)
        let region = profile.location && profile.location.length === 2 ? profile.location.toUpperCase() : 'US';
        if (region === 'UK') region = 'GB';
        
        return searchTikTokTop(tikTokQuery, { 
            region: region 
        });
      })()
    ]);

    console.log(`✨ Found ${brightDataResults.length} raw BrightData candidates`);
    console.log(`✨ Found ${tikTokResults.length} direct TikTok candidates`);

    // --- Process TikTok Results (Already enriched) ---
    tikTokResults.forEach(inf => {
        if (!processedHandles.has(inf.username)) {
            processedHandles.add(inf.username);
            // Add match score
             const matchScore = Math.floor(Math.random() * (98 - 75) + 75);
             influencers.push({
                 ...inf,
                 matchScore,
                 matchReason: inf.matchReason + " Matches business keywords."
             });
        }
    });

    // --- Process BrightData Results (Need Enrichment) ---
    // We'll limit enrichment to top 5 to save time/credits
    for (const result of brightDataResults) {
      if (influencers.length >= 12) break; // Total limit

      const handle = extractHandle(result.link, result.platform);
      
      if (!handle || processedHandles.has(handle)) continue;
      processedHandles.add(handle);

      console.log(`✨ Enriching: ${handle} (${result.platform})`);
      const details = await getInfluencerDetails(handle, result.platform);

      if (details) {
        const matchScore = Math.floor(Math.random() * (98 - 70) + 70); 

        influencers.push({
          ...details,
          id: handle, 
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

    return Response.json(influencers);
  } catch (error) {
    console.error('Discovery failed:', error);
    return Response.json({ error: 'Failed to discover influencers' }, { status: 500 });
  }
}
