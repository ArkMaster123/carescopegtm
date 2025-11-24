'use client';

import { useState } from 'react';
import { BusinessForm } from '@/components/BusinessForm';
import { InfluencerGallery } from '@/components/InfluencerGallery';
import { AnalysisReview } from '@/components/AnalysisReview';
import { Influencer, BusinessProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

// Define schema for useObject to match the API
const profileSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  targetCustomer: z.string().optional(),
  industry: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  tone: z.string().optional(),
  location: z.string().optional(),
});

export default function Home() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'review' | 'searching' | 'results'>('input');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { object: partialProfile, submit: submitAnalysis, isLoading: isAnalyzing } = useObject({
    api: '/api/analyze',
    schema: profileSchema,
    onFinish: () => {
      setStep('review');
    }
  });

  const handleStartAnalysis = (description: string) => {
    setStep('analyzing');
    submitAnalysis({ description });
  };

  const handleConfirmSearch = async (profile: BusinessProfile) => {
    setStep('searching');
    
    try {
      const discoverRes = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!discoverRes.ok) throw new Error('Discovery failed');
      const result = await discoverRes.json();

      setInfluencers(result.length === 0 ? [] : result);
      setStep('results');
    } catch (error) {
      console.error(error);
      setInfluencers([]);
      setStep('results');
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('input')}>
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
            <BusinessForm onSubmit={async (desc) => handleStartAnalysis(desc)} isLoading={false} />
          </div>
        )}

        {(step === 'analyzing' || step === 'review') && (
          <AnalysisReview 
            profile={partialProfile as Partial<BusinessProfile>} 
            isLoading={isAnalyzing} 
            onConfirm={handleConfirmSearch}
          />
        )}

        {step === 'searching' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-8"></div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Scouting Influencers...</h3>
            <p className="text-zinc-500">
              Searching TikTok, Instagram, and YouTube for authentic voices in <span className="font-medium text-zinc-900">{partialProfile?.industry || 'your niche'}</span>.
            </p>
          </div>
        )}

        {step === 'results' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
            {partialProfile && (
              <Card className="bg-zinc-50 border-zinc-200 shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Results for {partialProfile.industry}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Found {influencers.length} influencers in {partialProfile.location || 'Global'} matching your criteria.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setStep('review')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refine & Rerun
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <InfluencerGallery 
              influencers={influencers} 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}
      </div>
    </main>
  );
}
