'use client';

import { Influencer } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Instagram, Youtube, Video, Check } from 'lucide-react'; // Video as TikTok placeholder if needed
import { cn } from '@/lib/utils';

interface InfluencerCardProps {
  influencer: Influencer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (influencer: Influencer) => void;
}

export function InfluencerCard({ influencer, isSelected, onSelect, onViewDetails }: InfluencerCardProps) {
  const PlatformIcon = {
    instagram: Instagram,
    youtube: Youtube,
    tiktok: Video, // generic video icon for tiktok or custom svg
  }[influencer.platform];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-md border-2",
      isSelected ? "border-zinc-900 ring-1 ring-zinc-900" : "border-transparent hover:border-zinc-200"
    )}>
      <div className="relative h-48 bg-zinc-100 overflow-hidden">
        {/* In a real app, use next/image with proper configuration */}
        <img 
          src={influencer.profileImageUrl} 
          alt={influencer.displayName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={cn(
              "font-bold text-sm shadow-sm backdrop-blur-md bg-white/90",
              influencer.matchScore >= 80 ? "text-green-600" : "text-zinc-600"
            )}
          >
            {influencer.matchScore}% Match
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
           <Badge variant="secondary" className="bg-white/90 backdrop-blur-md shadow-sm">
              <PlatformIcon className="w-3 h-3 mr-1" />
              {influencer.platform}
           </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight text-zinc-900">{influencer.displayName}</h3>
            <p className="text-sm text-zinc-500 font-medium">@{influencer.username}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-4">
        <p className="text-sm text-zinc-600 line-clamp-2 mb-4 min-h-[40px]">
          {influencer.bio}
        </p>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-zinc-50 rounded-lg p-2">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Followers</p>
            <p className="font-bold text-zinc-900">{formatNumber(influencer.followerCount)}</p>
          </div>
          <div className="bg-zinc-50 rounded-lg p-2">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Avg Likes</p>
            <p className="font-bold text-zinc-900">{formatNumber(influencer.avgLikes)}</p>
          </div>
          <div className="bg-zinc-50 rounded-lg p-2">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Posts</p>
            <p className="font-bold text-zinc-900">{influencer.postCount !== undefined ? formatNumber(influencer.postCount) : '-'}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => onViewDetails(influencer)}
        >
          Details
        </Button>
        <Button 
          variant={isSelected ? "default" : "secondary"}
          className={cn("flex-1", isSelected && "bg-zinc-900")}
          onClick={() => onSelect(influencer.id)}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 mr-1" /> Saved
            </>
          ) : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
