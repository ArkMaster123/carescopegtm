import { streamObject } from 'ai';
import { z } from 'zod';
import { model } from '@/lib/ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    const result = streamObject({
      model,
      schema: z.object({
        name: z.string(),
        description: z.string(),
        targetCustomer: z.string(),
        industry: z.string(),
        keywords: z.array(z.string()),
        tone: z.string(),
        location: z.string().optional().describe('The target country or region for the business, e.g. "US", "UK", "Australia"'),
      }),
      prompt: `Analyze the following business description and extract key profile information:
      
      "${description}"
      
      Return a structured business profile including name, refined description, target customer, industry, keywords, brand tone, and target location/country if mentioned (default to "US" if not specific).`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Analysis failed:', error);
    return Response.json({ error: 'Failed to analyze business profile' }, { status: 500 });
  }
}
