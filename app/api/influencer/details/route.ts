import { getTikTokProfileVideos } from '@/lib/services/scrapecreators';

export async function POST(req: Request) {
  try {
    const { handle, platform } = await req.json();

    if (platform !== 'tiktok') {
      return Response.json({ error: 'Only TikTok is supported for detailed video stats currently.' }, { status: 400 });
    }

    // Fetch recent videos (default 20, trim true)
    const videos = await getTikTokProfileVideos(handle, { amount: 10, trim: true });

    return Response.json({ videos });
  } catch (error) {
    console.error('Details fetch failed:', error);
    return Response.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}
