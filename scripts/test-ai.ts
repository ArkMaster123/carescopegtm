import dotenv from 'dotenv';
import { generateText } from 'ai';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  // Dynamic import to ensure env vars are loaded first
  const { model } = await import('../lib/ai');

  console.log('🚀 Testing AI connection with OpenRouter (gpt-5-nano)...');

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ Error: OPENROUTER_API_KEY is missing in .env.local');
    process.exit(1);
  }

  try {
    const { text } = await generateText({
      model,
      prompt: 'Say "Hello, World!" and nothing else.',
    });

    console.log('✅ AI Response:', text);
    console.log('🎉 Connection successful!');
  } catch (error) {
    console.error('❌ AI Connection Failed:', error);
  }
}

main();
