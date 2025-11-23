"""
Agent-powered TikTok Scraper using Claude Agent SDK
Uses Brightdata MCP integration for real-time scraping
"""

import os
import json
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from claude_agent_sdk import query, ClaudeAgentOptions


class AgentTikTokScraper:
    """
    TikTok scraper powered by Claude Agent SDK and Brightdata MCP.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the agent scraper.

        Args:
            api_key: Anthropic API key (defaults to ANTHROPIC_API_KEY env var)
                    Only required when using use_agent=True
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

        self.cache_file = "influencers_cache.json"
        self.influencers_cache = []
        self._load_cache()

    def _load_cache(self):
        """Load cached influencer data"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    self.influencers_cache = json.load(f)
                print(f"📥 Loaded {len(self.influencers_cache)} influencers from cache")
            except Exception as e:
                print(f"⚠️ Error loading cache: {e}")
                self.influencers_cache = []

    def _save_cache(self):
        """Save influencer data to cache"""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self.influencers_cache, f, indent=2)
            print(f"💾 Saved {len(self.influencers_cache)} influencers to cache")
        except Exception as e:
            print(f"⚠️ Error saving cache: {e}")

    async def search_uk_influencers(
        self,
        keywords: List[str],
        min_followers: int = 10000,
        max_followers: Optional[int] = None,
        min_engagement_rate: float = 3.0,
        use_agent: bool = True
    ) -> List[Dict]:
        """
        Search for UK-based TikTok influencers using AI agent.

        Args:
            keywords: Search keywords/hashtags
            min_followers: Minimum follower count
            max_followers: Maximum follower count (None for no limit)
            min_engagement_rate: Minimum engagement rate percentage
            use_agent: Whether to use the AI agent (True) or cached data (False)

        Returns:
            List of influencer data dictionaries
        """
        if not use_agent:
            # Return filtered cache
            return self._filter_cached_influencers(
                min_followers, max_followers, min_engagement_rate
            )

        # Check API key when using agent
        if not self.api_key:
            print("❌ Error: ANTHROPIC_API_KEY not set")
            print("📦 Falling back to cached data...")
            return self._filter_cached_influencers(
                min_followers, max_followers, min_engagement_rate
            )

        print(f"\n🤖 Launching UK Influencer Scraper Agent...")
        print(f"🔍 Keywords: {', '.join(keywords)}")
        print(f"📊 Filters: {min_followers}+ followers, {min_engagement_rate}%+ engagement\n")

        # Create the options with system prompt
        options = ClaudeAgentOptions(
            model="claude-sonnet-4-5-20250929",
            system_prompt=self._get_agent_prompt(
                keywords, min_followers, max_followers, min_engagement_rate
            ),
        )

        # Create the search query prompt
        prompt = self._create_agent_query(
            keywords, min_followers, max_followers, min_engagement_rate
        )

        try:
            # Set API key in environment if provided
            if self.api_key:
                os.environ["ANTHROPIC_API_KEY"] = self.api_key

            # Run the query and collect results
            result_text = ""
            async for message in query(prompt=prompt, options=options):
                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'text'):
                            result_text += block.text

            # Extract influencer data from agent response
            influencers = self._extract_influencers_from_response(result_text)

            # Update cache with new data
            if influencers:
                self._merge_into_cache(influencers)
                self._save_cache()

            print(f"\n✅ Found {len(influencers)} UK influencers")
            return influencers

        except Exception as e:
            print(f"❌ Error running agent: {e}")
            print(f"📦 Falling back to cached data...")
            return self._filter_cached_influencers(
                min_followers, max_followers, min_engagement_rate
            )

    def _get_agent_prompt(
        self,
        keywords: List[str],
        min_followers: int,
        max_followers: Optional[int],
        min_engagement_rate: float
    ) -> str:
        """Generate the system prompt for the agent"""
        return f"""You are a UK influencer discovery agent. Your goal is to find TikTok influencers
that match specific criteria using Brightdata MCP tools.

SEARCH CRITERIA:
- Keywords: {', '.join(keywords)}
- Minimum followers: {min_followers:,}
- Maximum followers: {max_followers:,} {' (no limit)' if not max_followers else ''}
- Minimum engagement rate: {min_engagement_rate}%
- Location: United Kingdom only (England, Scotland, Wales, Northern Ireland)

INSTRUCTIONS:
1. Use Brightdata MCP tools (mcp__brightdata__*) to search TikTok
2. Only include influencers based in the UK
3. Calculate engagement rate: (total_likes / followers) * 100
4. Filter out accounts with engagement < {min_engagement_rate}%
5. Return results as JSON array

OUTPUT FORMAT:
Return a JSON array with this exact structure for each influencer:
[
  {{
    "username": "username_without_@",
    "display_name": "Display Name",
    "followers": 45000,
    "likes": 1200000,
    "videos": 234,
    "engagement_rate": 4.2,
    "location": "City, UK",
    "bio": "Bio text",
    "verified": true/false,
    "avg_views": 15000,
    "profile_url": "https://tiktok.com/@username",
    "scraped_at": "{datetime.now().isoformat()}"
  }}
]

Only return influencers that match ALL criteria. Be strict about UK location filtering."""

    def _create_agent_query(
        self,
        keywords: List[str],
        min_followers: int,
        max_followers: Optional[int],
        min_engagement_rate: float
    ) -> str:
        """Create the query to send to the agent"""
        max_str = f"and max {max_followers:,} followers" if max_followers else ""

        return f"""Search for UK-based TikTok influencers with these criteria:

- Keywords: {', '.join(keywords)}
- Min {min_followers:,} followers {max_str}
- Min {min_engagement_rate}% engagement rate
- UK location only

Use the Brightdata MCP tools to scrape TikTok and find influencers matching these criteria.
Return the results as a JSON array following the specified format."""

    def _extract_influencers_from_response(self, response: str) -> List[Dict]:
        """Extract influencer data from agent response"""
        try:
            # Try to find JSON in the response
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                influencers = json.loads(json_str)
                return influencers
            else:
                print("⚠️ No JSON array found in agent response")
                return []

        except json.JSONDecodeError as e:
            print(f"⚠️ Error parsing JSON from response: {e}")
            return []

    def _merge_into_cache(self, new_influencers: List[Dict]):
        """Merge new influencers into cache, avoiding duplicates"""
        existing_usernames = {inf['username'] for inf in self.influencers_cache}

        for influencer in new_influencers:
            if influencer['username'] not in existing_usernames:
                self.influencers_cache.append(influencer)
                existing_usernames.add(influencer['username'])

    def _filter_cached_influencers(
        self,
        min_followers: int,
        max_followers: Optional[int],
        min_engagement_rate: float
    ) -> List[Dict]:
        """Filter cached influencers based on criteria"""
        filtered = []

        for inf in self.influencers_cache:
            # Check follower count
            if inf.get('followers', 0) < min_followers:
                continue

            if max_followers and inf.get('followers', 0) > max_followers:
                continue

            # Check engagement rate
            if inf.get('engagement_rate', 0) < min_engagement_rate:
                continue

            # Check location (UK only)
            location = inf.get('location', '').lower()
            if not any(
                uk_term in location
                for uk_term in ['uk', 'united kingdom', 'britain', 'england',
                               'scotland', 'wales', 'london', 'manchester',
                               'birmingham', 'edinburgh', 'glasgow']
            ):
                continue

            filtered.append(inf)

        return filtered

    def add_sample_data(self):
        """Add sample UK influencer data for testing"""
        sample_influencers = [
            {
                "username": "ukfitness_guru",
                "display_name": "Sarah Fitness UK",
                "followers": 45000,
                "likes": 1200000,
                "videos": 234,
                "engagement_rate": 4.2,
                "location": "London, UK",
                "bio": "Fitness coach | Healthy living | UK based",
                "verified": False,
                "avg_views": 15000,
                "profile_url": "https://tiktok.com/@ukfitness_guru",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "username": "manchesterfoodie",
                "display_name": "Manchester Food Reviews",
                "followers": 67000,
                "likes": 2100000,
                "videos": 456,
                "engagement_rate": 5.8,
                "location": "Manchester, UK",
                "bio": "Food blogger | Restaurant reviews | Northern England",
                "verified": True,
                "avg_views": 28000,
                "profile_url": "https://tiktok.com/@manchesterfoodie",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "username": "edinburgh_lifestyle",
                "display_name": "Emma's Scottish Life",
                "followers": 32000,
                "likes": 890000,
                "videos": 189,
                "engagement_rate": 3.9,
                "location": "Edinburgh, UK",
                "bio": "Lifestyle content | Scotland | Travel & wellness",
                "verified": False,
                "avg_views": 12000,
                "profile_url": "https://tiktok.com/@edinburgh_lifestyle",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "username": "tech_london",
                "display_name": "London Tech Reviews",
                "followers": 89000,
                "likes": 3400000,
                "videos": 312,
                "engagement_rate": 6.1,
                "location": "London, UK",
                "bio": "Tech reviews | Gadgets | UK tech scene",
                "verified": True,
                "avg_views": 42000,
                "profile_url": "https://tiktok.com/@tech_london",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "username": "birmingham_beauty",
                "display_name": "Beauty by Jasmine",
                "followers": 54000,
                "likes": 1800000,
                "videos": 278,
                "engagement_rate": 4.7,
                "location": "Birmingham, UK",
                "bio": "Makeup artist | Beauty tips | West Midlands",
                "verified": False,
                "avg_views": 19000,
                "profile_url": "https://tiktok.com/@birmingham_beauty",
                "scraped_at": datetime.now().isoformat()
            }
        ]

        self.influencers_cache = sample_influencers
        self._save_cache()
        print(f"✅ Added {len(sample_influencers)} sample UK influencers to cache")
        return sample_influencers


# Synchronous wrapper for use in non-async contexts
def search_uk_influencers_sync(
    keywords: List[str],
    min_followers: int = 10000,
    max_followers: Optional[int] = None,
    min_engagement_rate: float = 3.0,
    use_agent: bool = True,
    api_key: Optional[str] = None
) -> List[Dict]:
    """
    Synchronous wrapper for searching UK influencers.

    Args:
        keywords: Search keywords/hashtags
        min_followers: Minimum follower count
        max_followers: Maximum follower count (None for no limit)
        min_engagement_rate: Minimum engagement rate percentage
        use_agent: Whether to use the AI agent (True) or cached data (False)
        api_key: Anthropic API key (optional)

    Returns:
        List of influencer data dictionaries
    """
    scraper = AgentTikTokScraper(api_key=api_key)

    # Run the async function in a new event loop
    return asyncio.run(
        scraper.search_uk_influencers(
            keywords=keywords,
            min_followers=min_followers,
            max_followers=max_followers,
            min_engagement_rate=min_engagement_rate,
            use_agent=use_agent
        )
    )


if __name__ == "__main__":
    # Test the agent scraper
    print("🚀 Testing Agent-powered TikTok Scraper\n")

    scraper = AgentTikTokScraper()

    # Add sample data for testing
    scraper.add_sample_data()

    # Test with cached data
    print("\n" + "="*50)
    print("Testing with cached data (no agent)...")
    print("="*50)

    results = asyncio.run(
        scraper.search_uk_influencers(
            keywords=["fitness", "food"],
            min_followers=30000,
            min_engagement_rate=4.0,
            use_agent=False  # Use cached data
        )
    )

    print(f"\n📊 Found {len(results)} influencers:")
    for inf in results:
        print(f"  • @{inf['username']} - {inf['followers']:,} followers - {inf['engagement_rate']}% engagement")

    # Uncomment to test with real agent (requires ANTHROPIC_API_KEY and Brightdata MCP)
    # print("\n" + "="*50)
    # print("Testing with AI Agent (requires API key and MCP)...")
    # print("="*50)
    #
    # results = asyncio.run(
    #     scraper.search_uk_influencers(
    #         keywords=["fitness", "food"],
    #         min_followers=30000,
    #         min_engagement_rate=4.0,
    #         use_agent=True  # Use AI agent
    #     )
    # )
