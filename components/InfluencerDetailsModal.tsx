'use client';

import { Influencer } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Heart, Users, Video, MessageCircle, Loader2, Play } from 'lucide-react';
import { useState } from 'react';

interface InfluencerDetailsModalProps {
  influencer: Influencer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InfluencerDetailsModal({ influencer, isOpen, onClose }: InfluencerDetailsModalProps) {
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videos, setVideos] = useState<Array<{
    id: string;
    desc: string;
    video: { cover: { url_list: string[] } };
    statistics: { play_count: number };
  }>>([]);

  if (!influencer) return null;

  const profileUrl = 
    influencer.platform === 'instagram' ? `https://instagram.com/${influencer.username}` :
    influencer.platform === 'tiktok' ? `https://tiktok.com/@${influencer.username}` :
    `https://youtube.com/${influencer.username}`;

  const handleLoadVideos = async () => {
    if (influencer.platform !== 'tiktok') return;
    
    setLoadingVideos(true);
    try {
        const res = await fetch('/api/influencer/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ handle: influencer.username, platform: influencer.platform })
        });
        if (res.ok) {
            const data = await res.json();
            setVideos(data.videos || []);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingVideos(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
            setVideos([]); // reset on close
        } 
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-zinc-100 shrink-0">
              <img 
                src={influencer.profileImageUrl} 
                alt={influencer.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{influencer.displayName}</DialogTitle>
              <DialogDescription className="text-base flex items-center gap-2 mt-1">
                 @{influencer.username} 
                 <Badge variant="secondary" className="capitalize">{influencer.platform}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-zinc-500 mb-2">Bio</h4>
              <p className="text-zinc-900 bg-zinc-50 p-4 rounded-lg">{influencer.bio || "No bio available."}</p>
            </div>

            <div>
               <h4 className="text-sm font-medium text-zinc-500 mb-2">Match Analysis</h4>
               <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-600 hover:bg-green-700">{influencer.matchScore}% Match</Badge>
                  </div>
                  <p className="text-green-900 text-sm">{influencer.matchReason}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-lg flex items-center gap-3">
                <Users className="w-5 h-5 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Followers</p>
                  <p className="text-lg font-bold">{influencer.followerCount.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg flex items-center gap-3">
                <Heart className="w-5 h-5 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Avg Likes</p>
                  <p className="text-lg font-bold">{influencer.avgLikes.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg flex items-center gap-3">
                <Video className="w-5 h-5 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Total Posts</p>
                  <p className="text-lg font-bold">{influencer.postCount?.toLocaleString() || '-'}</p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Avg Comments</p>
                  <p className="text-lg font-bold">{influencer.avgComments > 0 ? influencer.avgComments.toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>

            {influencer.platform === 'tiktok' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-zinc-500">Recent Videos</h4>
                        {videos.length === 0 && !loadingVideos && (
                            <Button variant="outline" size="sm" onClick={handleLoadVideos}>
                                Reveal Content
                            </Button>
                        )}
                    </div>

                    {loadingVideos && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                        </div>
                    )}

                    {videos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {videos.map((video) => (
                                <a 
                                    key={video.id} 
                                    href={`https://www.tiktok.com/@${influencer.username}/video/${video.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative aspect-[9/16] bg-black rounded-md overflow-hidden"
                                >
                                    <img 
                                        src={video.video?.cover?.url_list?.[0]} 
                                        alt={video.desc}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                                        <div className="flex items-center gap-1 mb-1 font-bold">
                                            <Play className="w-3 h-3 fill-white" />
                                            {video.statistics?.play_count?.toLocaleString()}
                                        </div>
                                        <p className="line-clamp-2 text-[10px] text-zinc-200">{video.desc}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 pt-4 border-t border-zinc-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-zinc-900 text-white gap-2" asChild>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              View on {influencer.platform} <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
