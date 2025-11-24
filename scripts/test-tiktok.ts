import { searchTikTokTop } from '../lib/services/scrapecreators';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🚀 Testing ScrapeCreators TikTok Search...');

  if (!process.env.SCRAPE_CREATORS_API_KEY) {
    console.error('❌ Error: SCRAPE_CREATORS_API_KEY is missing in .env.local');
    process.exit(1);
  }

  try {
    // Test query simulating what the API would send
    const query = "care leads lead generation"; 
    const region = "GB"; // Test UK region

    console.log(`📡 Sending query: "${query}" (Region: ${region})`);

    const results = await searchTikTokTop(query, { 
      region: region,
      sort_by: 'relevance' // Optional, but good for testing
    });

    console.log(`✅ Success! Found ${results.length} influencers.`);
    
    if (results.length > 0) {
      console.log('\nTop Result:');
      console.log('Name:', results[0].displayName);
      console.log('Handle:', results[0].username);
      console.log('Followers:', results[0].followerCount);
      console.log('Match Reason:', results[0].matchReason);
      console.log('Image URL:', results[0].profileImageUrl);
    } else {
      console.log('⚠️ No results found. Try a broader query or check region code.');
    }

  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

main();
