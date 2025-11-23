# CareScope GTM - UK Influencer Dashboard

A powerful dashboard for discovering and analyzing UK-based TikTok influencers using **Claude Agent SDK** and **Brightdata's MCP integration**.

## 🌟 Features

- 🤖 **AI-Powered Scraping**: Uses Claude Agent SDK with Brightdata MCP for intelligent influencer discovery
- 🇬🇧 **UK-Only Filtering**: Automatically filters for UK-based influencers (England, Scotland, Wales, Northern Ireland)
- 📊 **Real-time Analytics**: Live engagement metrics, follower growth, and content analysis
- 🔍 **Advanced Search**: Filter by keywords, follower count, engagement rate, and location
- 📈 **Visual Analytics**: Interactive charts and graphs using Plotly
- 💾 **Data Export**: Export influencer data to CSV for further analysis
- ⚡ **Dual Mode**: Choose between AI Agent mode (real-time) or cached data mode

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- [Anthropic API key](https://console.anthropic.com/) (for AI Agent mode)
- [Brightdata account](https://brightdata.com/) with API token

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ArkMaster123/carescopegtm.git
cd carescopegtm
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

4. **Set up Brightdata MCP** (one-time setup)
```bash
claude mcp add --transport sse brightdata "https://mcp.brightdata.com/sse?token=<your-brightdata-api-token>"
```

Verify the connection:
```bash
claude mcp list
# Should show: brightdata: https://mcp.brightdata.com/sse?token=****** (SSE) - ✓ Connected
```

5. **Run the dashboard**
```bash
streamlit run dashboard.py
```

The dashboard will open at `http://localhost:8501`

## 📖 Usage Guide

### Getting Started

1. **Load Sample Data** (for testing)
   - Click "🔄 Load Sample Data" in the sidebar
   - This loads 5 sample UK influencers to test the dashboard

2. **Set Your Filters**
   - **Keywords**: Enter search terms (e.g., "fitness, food, tech")
   - **Follower Range**: Set minimum/maximum follower counts
   - **Engagement Rate**: Set minimum engagement percentage
   - **Location**: Filter by UK region

3. **Choose Your Mode**
   - **📦 Cached Data Mode** (default): Fast, uses locally cached influencer data
   - **🤖 AI Agent Mode**: Real-time scraping using Claude Agent SDK + Brightdata MCP

4. **Search**
   - Click "🚀 Search Influencers" to find matching profiles

### Dashboard Tabs

#### 📊 Dashboard
- Overview metrics (total influencers, combined reach, avg engagement)
- Follower distribution chart
- Engagement rate vs followers scatter plot
- Location breakdown pie chart

#### 👤 Influencers
- Detailed influencer cards with all metrics
- Sort by followers or engagement rate
- Direct links to TikTok profiles
- Verification status

#### 📈 Analytics
- Engagement quality distribution
- Statistical summaries
- CSV export functionality

## 🤖 AI Agent Integration

This project uses the **Claude Agent SDK** to power intelligent influencer discovery.

### How It Works

1. **Agent Configuration**: Defined in `.claude/agents/uk_influencer_scraper.md`
2. **MCP Integration**: Connects to Brightdata's TikTok scraper via MCP
3. **Smart Filtering**: AI agent applies UK-location filtering and engagement calculations
4. **Structured Output**: Returns JSON-formatted influencer data

### Agent Mode vs Cached Mode

| Feature | AI Agent Mode | Cached Mode |
|---------|--------------|-------------|
| Speed | Slower (API calls) | Fast |
| Data Freshness | Real-time | Historical |
| API Cost | Uses Claude API credits | Free |
| Brightdata Required | Yes | No |
| Best For | New searches, up-to-date data | Quick filtering, testing |

### Using the Agent Programmatically

```python
from agent_scraper import AgentTikTokScraper
import asyncio

# Initialize scraper
scraper = AgentTikTokScraper(api_key="your_anthropic_api_key")

# Search with AI agent
results = asyncio.run(
    scraper.search_uk_influencers(
        keywords=["fitness", "wellness"],
        min_followers=50000,
        min_engagement_rate=4.0,
        use_agent=True  # Enable AI agent
    )
)

print(f"Found {len(results)} influencers")
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```bash
ANTHROPIC_API_KEY=sk-ant-...  # Required for AI Agent mode
```

### Brightdata MCP Setup

The Brightdata MCP server provides access to TikTok scraping tools. Configure it once using:

```bash
claude mcp add --transport sse brightdata "https://mcp.brightdata.com/sse?token=YOUR_TOKEN"
```

Get your Brightdata API token from [Brightdata User Settings](https://brightdata.com/cp/setting/users).

## 📁 Project Structure

```
carescopegtm/
├── .claude/
│   └── agents/
│       └── uk_influencer_scraper.md   # AI agent configuration
├── dashboard.py                        # Streamlit dashboard
├── agent_scraper.py                    # Claude Agent SDK scraper
├── tiktok_scraper.py                  # Legacy scraper (basic)
├── requirements.txt                    # Python dependencies
├── .env.example                        # Environment template
└── README.md                          # This file
```

## 🎯 Example Use Cases

### Find Fitness Influencers in London
```
Keywords: fitness, gym, workout
Min Followers: 20,000
Min Engagement: 4%
Location: London
```

### Discover Food Bloggers Across UK
```
Keywords: food, restaurant, cooking
Min Followers: 10,000
Min Engagement: 3%
Location: All UK
```

### High-Engagement Tech Reviewers
```
Keywords: tech, gadgets, reviews
Min Followers: 50,000
Min Engagement: 5%
Location: All UK
```

## 🛠️ Development

### Testing the Agent

```bash
# Test with sample data (no API needed)
python agent_scraper.py

# Test with AI agent (requires ANTHROPIC_API_KEY)
# Uncomment the agent test section in agent_scraper.py
```

### Adding Custom Filters

Edit `agent_scraper.py` to customize:
- Engagement rate calculation
- Location matching logic
- Data validation rules

## 📊 Data Schema

Each influencer object contains:

```json
{
  "username": "ukfitness_guru",
  "display_name": "Sarah Fitness UK",
  "followers": 45000,
  "likes": 1200000,
  "videos": 234,
  "engagement_rate": 4.2,
  "location": "London, UK",
  "bio": "Fitness coach | Healthy living",
  "verified": false,
  "avg_views": 15000,
  "profile_url": "https://tiktok.com/@ukfitness_guru",
  "scraped_at": "2024-01-01T00:00:00"
}
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Claude Agent SDK Documentation](https://docs.anthropic.com/en/agent-sdk)
- [Brightdata MCP Integration](https://mcp.brightdata.com/)
- [Streamlit Documentation](https://docs.streamlit.io/)

## ⚠️ Disclaimer

This tool is for legitimate marketing research purposes only. Always comply with:
- TikTok's Terms of Service
- Data protection regulations (GDPR, etc.)
- Influencer privacy rights
- Brightdata's usage policies

---

Built with ❤️ using Claude Agent SDK and Brightdata MCP
