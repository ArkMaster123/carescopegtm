'use client';

import { useState } from 'react';
import { Influencer } from '@/types';
import { InfluencerCard } from './InfluencerCard';
import { Button } from '@/components/ui/button';

interface InfluencerGalleryProps {
  influencers: Influencer[];
}

export function InfluencerGallery({ influencers }: InfluencerGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleViewDetails = (influencer: Influencer) => {
    // Placeholder for modal trigger
    console.log('View details', influencer);
    alert(`Details for ${influencer.displayName}\n\n${influencer.matchReason}`);
  };

  if (influencers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-zinc-900">No influencers found yet.</h3>
        <p className="text-zinc-500">Try running a search to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          Found {influencers.length} Influencers
        </h2>
        <div className="text-sm text-zinc-500">
          {selectedIds.size} selected
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {influencers.map((influencer) => (
          <InfluencerCard
            key={influencer.id}
            influencer={influencer}
            isSelected={selectedIds.has(influencer.id)}
            onSelect={toggleSelection}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <Button className="shadow-xl bg-zinc-900 text-white px-8 py-6 rounded-full text-lg animate-in fade-in slide-in-from-bottom-4">
            Export {selectedIds.size} Influencers
          </Button>
        </div>
      )}
    </div>
  );
}
