Sphere of Influence
Product Requirements Document
Overview
Sphere of Influence is an AI-powered platform that helps businesses find and match with the right nano-influencers. The core philosophy is less is more — quality over quantity, authentic voices over big numbers.
Problem
Small businesses struggle to find authentic influencer partnerships. Macro-influencers are expensive and often deliver poor ROI. Meanwhile, nano-influencers (under 10K followers) have higher engagement rates and more authentic connections with their audience — but they're hard to discover.
Solution
An AI agent that understands your business, searches for rising nano-influencers, and presents them in a beautiful, actionable interface.
User Journey
Four simple steps:
Step 1: Describe Your Business
User describes their business and target customer in a simple text input. No complicated forms — just tell us about your business.
•	Text input for business description
•	AI analyzes and extracts: industry, keywords, target customer, brand tone
•	Optional: Upload logo/images for frontend display
•	Future: Auto-scrape from website URL
Step 2: AI Finds Influencers
BrightData MCP agent searches for relevant nano-influencers based on the business profile.
•	Target: 1,000–10,000 followers (nano-influencers)
•	Filter for growth signals: consistent posting, increasing engagement
•	Pull profile images and bio for display
•	Platforms: Instagram, TikTok, YouTube
•	AI scores each match (0-100) with reasoning
Step 3: Browse Gallery
Influencers displayed in a beautiful card gallery. Visual-first design — users can quickly scan and identify potential fits.
•	Card shows: profile image, username, follower count, engagement rate
•	Match score badge (e.g., "92% Match")
•	Quick bio preview
•	Sortable by match score, followers, engagement
Step 4: Select & Save
Users select their favorites via modal detail view and checkboxes.
•	Click card → Modal popup with full details
•	Checkbox to mark as "Best Fit"
•	View recent posts, engagement stats, growth trajectory
•	Export selected influencers list
Tech Stack
Layer	Technology
Frontend	Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
AI/LLM	Claude API (Anthropic) via AI SDK
Data Scraping	BrightData MCP (Model Context Protocol)
State	React state (useState/useReducer), Zustand if needed
Database	Optional: Supabase/Postgres for saved searches

Data Model
BusinessProfile
1.	name: string
2.	description: string
3.	targetCustomer: string
4.	industry: string
5.	keywords: string[]
6.	tone: string
7.	images?: string[]
Influencer
1.	id: string
2.	username: string
3.	platform: 'instagram' | 'tiktok' | 'youtube'
4.	displayName: string
5.	bio: string
6.	profileImageUrl: string
7.	followerCount: number
8.	engagementRate: number
9.	avgLikes: number
10.	avgComments: number
11.	postFrequency: string
12.	contentCategories: string[]
13.	recentGrowth: number (% in last 30 days)
14.	matchScore: number (0-100)
15.	matchReason: string
API Routes (Next.js)
Method	Route	Description
POST	/api/analyze	Analyze business description → BusinessProfile
POST	/api/discover	Find influencers via BrightData MCP
POST	/api/score	Score influencer-business matches

UI Components
Pages
1.	/ — Landing + business input form
2.	/results — Influencer gallery + selection
3.	/saved — Saved/selected influencers
Components
1.	BusinessForm — Text input for description
2.	InfluencerCard — Gallery card with image, stats, match score
3.	InfluencerGallery — Grid of cards, sorting, filtering
4.	InfluencerModal — Detail popup with full profile
5.	SelectionCheckbox — Mark as "Best Fit"
6.	LoadingState — Skeleton cards during search
Success Metrics
•	Time from input to results: < 30 seconds
•	Influencer relevance: > 80% match accuracy (user feedback)
•	User engagement: Average 5+ cards clicked per session
•	Selection rate: > 3 influencers saved per search
MVP Scope
In Scope (v1)
•	Business description input (text)
•	AI business analyzer
•	BrightData influencer discovery
•	Gallery card UI
•	Modal detail view
•	Checkbox selection
Future (v2+)
•	Website URL scraping
•	Multi-platform search
•	Saved searches + history
•	Influencer outreach templates
•	Campaign tracking
Philosophy
Less is more. We're not building another bloated marketing tool. We're building something simple, beautiful, and effective.
•	One input, many insights
•	Quality nano-influencers > expensive macro-influencers
•	Visual-first, data-supported
•	Fast, focused, frictionless
