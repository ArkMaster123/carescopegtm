# CareScope GTM - UK Influencer Dashboard

A dashboard for discovering and analyzing UK-based TikTok influencers using Brightdata's MCP integration.

## Features

- 🇬🇧 UK-only influencer filtering
- 📊 Real-time TikTok data scraping via Brightdata MCP
- 📈 Engagement metrics and analytics
- 🔍 Search and filter capabilities
- 📱 Responsive dashboard interface

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure Brightdata MCP is configured:
```bash
claude mcp add --transport sse brightdata "https://mcp.brightdata.com/sse?token=<your-api-token>"
```

3. Run the dashboard:
```bash
streamlit run dashboard.py
```

## Usage

The dashboard allows you to:
- Search for UK influencers by keywords/hashtags
- View follower counts, engagement rates, and content metrics
- Filter by follower range, engagement rate, and location
- Export influencer data for further analysis
