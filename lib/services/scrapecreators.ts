import { Influencer, Platform } from '@/types';

const API_BASE = 'https://api.scrapecreators.com/v1';

export async function getInfluencerDetails(handle: string, platform: Platform): Promise<Partial<Influencer> | null> {
  const apiKey = process.env.SCRAPE_CREATORS_API_KEY;
  
  if (!apiKey) {
    console.error('Missing ScrapeCreators API Key');
    return null;
  }

  try {
    // Normalize handle (remove @ for API call if needed, but usually APIs expect it or handle it)
    // ScrapeCreators docs show `handle=iamsydneythomas` (no @) for TikTok
    const cleanHandle = handle.replace('@', '');
    
    const url = `${API_BASE}/${platform}/profile?handle=${cleanHandle}`;
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      console.error(`ScrapeCreators Error (${platform}): ${response.status} for ${handle}`);
      return null;
    }

    const data = await response.json();
    
    // Map response to Influencer interface
    // Note: Response structure varies by platform, need to adapt based on actual response
    // This is a best-effort mapping based on typical fields.
    
    let influencer: Partial<Influencer> = {
      username: handle,
      platform,
      matchScore: 0, 
      matchReason: '',
    };

    if (platform === 'instagram') {
      // Instagram mapping based on typical ScrapeCreators response
      influencer = {
        ...influencer,
        displayName: data.full_name || data.username,
        bio: data.biography,
        profileImageUrl: data.profile_pic_url,
        followerCount: data.follower_count,
        engagementRate: 0, // Requires posts analysis not available in basic profile
        avgLikes: 0,
        recentGrowth: 0, 
      };
    } else if (platform === 'tiktok') {
      // TikTok mapping
      influencer = {
        ...influencer,
        displayName: data.nickname || data.unique_id,
        bio: data.signature,
        profileImageUrl: data.avatar_larger,
        followerCount: data.follower_count,
        engagementRate: 0,
        avgLikes: data.total_favorited, 
      };
    } else if (platform === 'youtube') {
      // YouTube mapping (uses /v1/youtube/channel)
      influencer = {
        ...influencer,
        displayName: data.title,
        bio: data.description,
        profileImageUrl: data.avatar?.[0]?.url || data.thumbnails?.default?.url,
        followerCount: parseSubscribers(data.subscriber_count_text || data.stats?.subscriberCount),
        engagementRate: 0,
      };
    }

    return influencer;
  } catch (error) {
    console.error('ScrapeCreators Exception:', error);
    return null;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
function calculateEngagement(posts: any[], followers: number): number {
  if (!followers || followers === 0 || !posts || posts.length === 0) return 0;
  const totalInteractions = posts.slice(0, 10).reduce((acc, post) => {
    const node = post.node || post;
    return acc + (node.edge_liked_by?.count || 0) + (node.edge_media_to_comment?.count || 0);
  }, 0);
  return ((totalInteractions / posts.slice(0, 10).length) / followers) * 100;
}

function calculateAvgLikes(posts: any[]): number {
  if (!posts || posts.length === 0) return 0;
  const totalLikes = posts.slice(0, 10).reduce((acc, post) => {
    return acc + (post.node?.edge_liked_by?.count || 0);
  }, 0);
  return Math.round(totalLikes / posts.slice(0, 10).length);
}
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-explicit-any */

function parseSubscribers(count: string | number): number {
  if (typeof count === 'number') return count;
  if (!count) return 0;
  // Handle "1.2M", "100K" etc if needed, or basic parsing
  return parseInt(count.replace(/,/g, '')) || 0;
}
