'use client';

import { useState } from 'react';
import { BusinessForm } from '@/components/BusinessForm';
import { InfluencerGallery } from '@/components/InfluencerGallery';
import { Influencer } from '@/types';

export default function Home() {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);

  const handleAnalyze = async (description: string) => {
    setStep('loading');
    
    try {
      // 1. Analyze Business Profile
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      
      if (!analyzeRes.ok) throw new Error('Analysis failed');
      const profile = await analyzeRes.json();

      // 2. Discover Influencers
      const discoverRes = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!discoverRes.ok) throw new Error('Discovery failed');
      const result = await discoverRes.json();

      if (result.length === 0) {
        // Fallback to mock data if no real results (for demo/testing stability)
        // Only show mock data if explicitly in "demo mode" or if error handling strategy requires it.
        // For now, we want to see "0 found" if the API returns 0, so we can debug.
        // But user asked for "weird result... wrong one", implying they saw the mock data because of the error.
        // I will clear the mock fallback so we can see the REAL empty result if it fails again, 
        // which helps debugging.
        setInfluencers([]); 
      } else {
        setInfluencers(result);
      }
      setStep('results');
    } catch (error) {
      console.error(error);
      // In a real app, show error toast here
      // Fallback for demo
      setInfluencers(mockInfluencers);
      setStep('results');
    }
  };

  // Temporary mock data move inside function or keep as fallback
  const mockInfluencers: Influencer[] = [
    /*
    {
      id: '1',
      username: 'coffeelover_pnw',
      platform: 'instagram',
      displayName: 'Sarah Brews',
      bio: 'PNW based coffee enthusiast. Sustainable living & daily brews. 🌿☕️',
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      followerCount: 4500,
      engagementRate: 8.5,
      avgLikes: 350,
      avgComments: 42,
      postFrequency: 'daily',
      contentCategories: ['lifestyle', 'coffee', 'sustainability'],
      recentGrowth: 12,
      matchScore: 94,
      matchReason: 'Perfect match for sustainable coffee brand. High engagement with eco-conscious audience in target region.'
    },
    // ... other mocks
    */
  ];

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Sphere of Influence</h1>
          </div>
          {step === 'results' && (
            <button 
              onClick={() => setStep('input')}
              className="text-sm text-zinc-600 hover:text-zinc-900 font-medium"
            >
              New Search
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'input' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Find your perfect voices.</h2>
              <p className="text-lg text-zinc-600">
                Quality over quantity. We use AI to match your business with authentic nano-influencers who actually care.
              </p>
            </div>
            <BusinessForm onSubmit={handleAnalyze} isLoading={false} />
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-8"></div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Analyzing your business...</h3>
            <p className="text-zinc-500">Our AI is scouting the best nano-influencers for you.</p>
          </div>
        )}

        {step === 'results' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <InfluencerGallery influencers={influencers} />
          </div>
        )}
      </div>
    </main>
  );
}
