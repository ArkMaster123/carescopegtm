# Sphere of Influence

An AI-powered platform that helps businesses find and match with the right nano-influencers.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **AI**: Vercel AI SDK, OpenRouter (GPT-5 Nano)
- **Language**: TypeScript

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Set up environment variables:
    Create a `.env.local` file and add your OpenRouter API key:
    ```env
    OPENROUTER_API_KEY=your_api_key_here
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/`: Next.js App Router pages and API routes
- `components/`: React components (UI and feature-specific)
- `lib/`: Utility functions and AI configuration
- `types/`: TypeScript interfaces

## Features

- **Business Analysis**: Enter a business description to generate a profile.
- **Influencer Discovery**: (Mocked) Find nano-influencers matching the profile.
- **Matching**: (Mocked) AI-scored matching based on relevance.
