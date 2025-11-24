'use client';

import { useState } from 'react';
import { Influencer } from '@/types';
import { InfluencerCard } from './InfluencerCard';
import { Button } from '@/components/ui/button';
import { InfluencerDetailsModal } from './InfluencerDetailsModal';
import { LayoutGrid, List as ListIcon, Check, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface InfluencerGalleryProps {
  influencers: Influencer[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function InfluencerGallery({ influencers, viewMode, onViewModeChange }: InfluencerGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-500">
            {selectedIds.size} selected
          </div>
          <div className="flex items-center border rounded-md bg-white">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-r-none px-3 ${viewMode === 'grid' ? 'bg-zinc-100' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-l-none px-3 ${viewMode === 'list' ? 'bg-zinc-100' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map((influencer) => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              isSelected={selectedIds.has(influencer.id)}
              onSelect={toggleSelection}
              onViewDetails={setSelectedInfluencer}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Influencer</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Match</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.map((influencer) => (
                <TableRow key={influencer.id} className="hover:bg-zinc-50 cursor-pointer" onClick={() => setSelectedInfluencer(influencer)}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div 
                      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${selectedIds.has(influencer.id) ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300'}`}
                      onClick={() => toggleSelection(influencer.id)}
                    >
                      {selectedIds.has(influencer.id) && <Check className="w-3 h-3" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100">
                        <img 
                          src={influencer.profileImageUrl} 
                          alt={influencer.displayName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{influencer.displayName}</div>
                        <div className="text-xs text-zinc-500">@{influencer.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {influencer.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(influencer.followerCount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{influencer.avgLikes > 0 ? `${formatNumber(influencer.avgLikes)} Likes` : '-'}</span>
                      <span className="text-zinc-500">{influencer.postCount ? `${influencer.postCount} Posts` : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={influencer.matchScore >= 80 ? "text-green-600 border-green-200 bg-green-50" : ""}
                    >
                      {influencer.matchScore}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedInfluencer(influencer)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <Button className="shadow-xl bg-zinc-900 text-white px-8 py-6 rounded-full text-lg animate-in fade-in slide-in-from-bottom-4 hover:scale-105 transition-transform">
            Export {selectedIds.size} Influencers
          </Button>
        </div>
      )}

      <InfluencerDetailsModal 
        influencer={selectedInfluencer} 
        isOpen={!!selectedInfluencer} 
        onClose={() => setSelectedInfluencer(null)} 
      />
    </div>
  );
}
