"""
CareScope GTM - UK Influencer Dashboard
Streamlit dashboard for discovering and analyzing UK-based TikTok influencers
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import asyncio
from agent_scraper import AgentTikTokScraper
from datetime import datetime


# Page configuration
st.set_page_config(
    page_title="CareScope GTM - UK Influencer Dashboard",
    page_icon="🇬🇧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .influencer-card {
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
        background-color: white;
    }
    </style>
""", unsafe_allow_html=True)


@st.cache_resource
def get_scraper():
    """Initialize and cache the scraper"""
    return AgentTikTokScraper()


def format_number(num):
    """Format large numbers with K/M suffix"""
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.1f}K"
    return str(num)


def display_influencer_card(influencer):
    """Display a formatted influencer card"""
    col1, col2, col3 = st.columns([1, 2, 1])

    with col1:
        # Profile picture placeholder
        st.markdown(f"### @{influencer['username']}")
        if influencer.get('verified', False):
            st.markdown("✅ **Verified**")

    with col2:
        st.markdown(f"**{influencer['display_name']}**")
        st.markdown(f"📍 {influencer['location']}")
        st.markdown(f"_{influencer['bio']}_")

    with col3:
        st.metric("Followers", format_number(influencer['followers']))
        st.metric("Engagement", f"{influencer['engagement_rate']}%")

    # Additional metrics in expandable section
    with st.expander("📊 Detailed Metrics"):
        metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)

        with metric_col1:
            st.metric("Total Likes", format_number(influencer['likes']))
        with metric_col2:
            st.metric("Videos", influencer['videos'])
        with metric_col3:
            st.metric("Avg Views", format_number(influencer['avg_views']))
        with metric_col4:
            engagement_quality = "🔥 High" if influencer['engagement_rate'] > 5 else "✅ Good" if influencer['engagement_rate'] > 3 else "📊 Average"
            st.metric("Quality", engagement_quality)

        st.markdown(f"[View Profile]({influencer['profile_url']})")


def main():
    # Header
    st.markdown('<div class="main-header">🇬🇧 CareScope GTM - UK Influencer Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Discover and analyze UK-based TikTok influencers for your marketing campaigns</div>', unsafe_allow_html=True)

    # Initialize scraper
    scraper = get_scraper()

    # Sidebar filters
    st.sidebar.header("🔍 Search & Filters")

    # Keywords input
    keywords_input = st.sidebar.text_input(
        "Search Keywords (comma-separated)",
        placeholder="e.g., fitness, food, tech",
        help="Enter keywords to search for influencers"
    )
    keywords = [k.strip() for k in keywords_input.split(",") if k.strip()] if keywords_input else []

    # Follower range
    st.sidebar.subheader("👥 Follower Range")
    min_followers = st.sidebar.number_input(
        "Minimum Followers",
        min_value=0,
        max_value=10_000_000,
        value=10_000,
        step=5_000
    )

    max_followers = st.sidebar.number_input(
        "Maximum Followers (0 = no limit)",
        min_value=0,
        max_value=10_000_000,
        value=0,
        step=5_000
    )

    # Engagement rate
    min_engagement = st.sidebar.slider(
        "Minimum Engagement Rate (%)",
        min_value=0.0,
        max_value=20.0,
        value=3.0,
        step=0.1
    )

    # Location filter
    st.sidebar.subheader("📍 Location")
    location_filter = st.sidebar.selectbox(
        "UK Region",
        ["All UK", "London", "Manchester", "Birmingham", "Edinburgh", "Scotland", "Wales", "Northern Ireland"]
    )

    # AI Agent toggle
    st.sidebar.subheader("🤖 AI Agent")
    use_agent = st.sidebar.checkbox(
        "Use AI Agent for scraping",
        value=False,
        help="Enable to use Claude Agent SDK with Brightdata MCP for real-time scraping. Requires ANTHROPIC_API_KEY."
    )

    if use_agent:
        st.sidebar.info("🤖 AI Agent enabled - will use Brightdata MCP for real-time scraping")
    else:
        st.sidebar.info("📦 Using cached data - toggle AI Agent for real-time scraping")

    # Initialize data button
    if st.sidebar.button("🔄 Load Sample Data", help="Load sample UK influencer data for testing"):
        with st.spinner("Loading sample data..."):
            scraper.add_sample_data()
            st.sidebar.success("✅ Sample data loaded!")

    # Search button
    if st.sidebar.button("🚀 Search Influencers", type="primary"):
        st.session_state.search_triggered = True

    # Main content area
    tab1, tab2, tab3 = st.tabs(["📊 Dashboard", "👤 Influencers", "📈 Analytics"])

    # Get influencer data
    max_followers_filter = max_followers if max_followers > 0 else None

    # Run search (handle async if using agent)
    try:
        if use_agent:
            with st.spinner("🤖 AI Agent searching for influencers..."):
                influencers = asyncio.run(
                    scraper.search_uk_influencers(
                        keywords=keywords,
                        min_followers=min_followers,
                        max_followers=max_followers_filter,
                        min_engagement_rate=min_engagement,
                        use_agent=True
                    )
                )
        else:
            influencers = asyncio.run(
                scraper.search_uk_influencers(
                    keywords=keywords,
                    min_followers=min_followers,
                    max_followers=max_followers_filter,
                    min_engagement_rate=min_engagement,
                    use_agent=False
                )
            )
    except Exception as e:
        st.error(f"❌ Error searching for influencers: {e}")
        st.info("💡 Tip: Make sure ANTHROPIC_API_KEY is set if using AI Agent, or use cached data mode.")
        influencers = []

    # Apply location filter
    if location_filter != "All UK":
        influencers = [inf for inf in influencers if location_filter.lower() in inf.get('location', '').lower()]

    # TAB 1: Dashboard Overview
    with tab1:
        if not influencers:
            st.info("👋 No influencers found. Try adjusting your filters or load sample data from the sidebar.")
        else:
            # Key metrics
            st.subheader("📊 Overview Metrics")
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric("Total Influencers", len(influencers))

            with col2:
                total_followers = sum(inf['followers'] for inf in influencers)
                st.metric("Combined Reach", format_number(total_followers))

            with col3:
                avg_engagement = sum(inf['engagement_rate'] for inf in influencers) / len(influencers)
                st.metric("Avg Engagement", f"{avg_engagement:.1f}%")

            with col4:
                verified_count = sum(1 for inf in influencers if inf.get('verified', False))
                st.metric("Verified Accounts", verified_count)

            # Charts
            st.subheader("📈 Analytics")

            col1, col2 = st.columns(2)

            with col1:
                # Follower distribution
                df = pd.DataFrame(influencers)
                fig = px.bar(
                    df.sort_values('followers', ascending=True),
                    x='followers',
                    y='username',
                    orientation='h',
                    title='Follower Count by Influencer',
                    labels={'followers': 'Followers', 'username': 'Username'},
                    color='engagement_rate',
                    color_continuous_scale='Viridis'
                )
                st.plotly_chart(fig, use_container_width=True)

            with col2:
                # Engagement rate scatter
                fig = px.scatter(
                    df,
                    x='followers',
                    y='engagement_rate',
                    size='avg_views',
                    color='location',
                    hover_data=['username', 'display_name'],
                    title='Engagement Rate vs Followers',
                    labels={
                        'followers': 'Followers',
                        'engagement_rate': 'Engagement Rate (%)',
                        'location': 'Location'
                    }
                )
                st.plotly_chart(fig, use_container_width=True)

            # Location breakdown
            st.subheader("📍 Location Distribution")
            location_counts = df['location'].value_counts()
            fig = px.pie(
                values=location_counts.values,
                names=location_counts.index,
                title='Influencers by Location'
            )
            st.plotly_chart(fig, use_container_width=True)

    # TAB 2: Influencer List
    with tab2:
        st.subheader(f"👤 Found {len(influencers)} UK Influencers")

        if not influencers:
            st.info("No influencers match your criteria. Try adjusting the filters.")
        else:
            # Sort options
            sort_by = st.selectbox(
                "Sort by",
                ["Followers (High to Low)", "Followers (Low to High)", "Engagement Rate (High to Low)", "Engagement Rate (Low to High)"]
            )

            # Sort influencers
            if "Followers (High to Low)" in sort_by:
                influencers_sorted = sorted(influencers, key=lambda x: x['followers'], reverse=True)
            elif "Followers (Low to High)" in sort_by:
                influencers_sorted = sorted(influencers, key=lambda x: x['followers'])
            elif "Engagement Rate (High to Low)" in sort_by:
                influencers_sorted = sorted(influencers, key=lambda x: x['engagement_rate'], reverse=True)
            else:
                influencers_sorted = sorted(influencers, key=lambda x: x['engagement_rate'])

            # Display influencer cards
            for influencer in influencers_sorted:
                with st.container():
                    display_influencer_card(influencer)
                    st.divider()

    # TAB 3: Analytics
    with tab3:
        st.subheader("📈 Advanced Analytics")

        if not influencers:
            st.info("Load influencer data to see analytics.")
        else:
            df = pd.DataFrame(influencers)

            # Engagement quality breakdown
            st.subheader("Engagement Quality Distribution")
            high_engagement = len(df[df['engagement_rate'] > 5])
            good_engagement = len(df[(df['engagement_rate'] >= 3) & (df['engagement_rate'] <= 5)])
            avg_engagement = len(df[df['engagement_rate'] < 3])

            quality_df = pd.DataFrame({
                'Quality': ['High (>5%)', 'Good (3-5%)', 'Average (<3%)'],
                'Count': [high_engagement, good_engagement, avg_engagement]
            })

            fig = px.bar(quality_df, x='Quality', y='Count', title='Engagement Quality Breakdown', color='Quality')
            st.plotly_chart(fig, use_container_width=True)

            # Detailed statistics
            st.subheader("📊 Statistical Summary")
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("**Followers**")
                st.write(df['followers'].describe())

            with col2:
                st.markdown("**Engagement Rate**")
                st.write(df['engagement_rate'].describe())

            # Export data
            st.subheader("💾 Export Data")
            csv = df.to_csv(index=False)
            st.download_button(
                label="📥 Download CSV",
                data=csv,
                file_name=f"uk_influencers_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )

    # Footer
    st.sidebar.divider()
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 💡 About")
    st.sidebar.info(
        "This dashboard uses Brightdata MCP integration to discover and analyze "
        "UK-based TikTok influencers for your marketing campaigns.\n\n"
        "**Features:**\n"
        "- 🇬🇧 UK-only filtering\n"
        "- 📊 Real-time analytics\n"
        "- 🔍 Advanced search\n"
        "- 💾 Data export"
    )


if __name__ == "__main__":
    main()
