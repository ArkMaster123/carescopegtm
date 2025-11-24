'use client';

import { BusinessProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Loader2, Search, X, Plus } from 'lucide-react';

interface AnalysisReviewProps {
  profile: Partial<BusinessProfile>;
  isLoading: boolean;
  onConfirm: (profile: BusinessProfile) => void;
}

export function AnalysisReview({ profile, isLoading, onConfirm }: AnalysisReviewProps) {
  const [editedProfile, setEditedProfile] = useState<Partial<BusinessProfile>>(profile || {});
  const [newKeyword, setNewKeyword] = useState('');

  // Use a ref to track if we've initialized the local state to avoid useEffect sync issues
  // But for streaming updates, we actually want to sync.
  // The issue is typically setting state that triggers re-render.
  // We can just use the prop `profile` directly for display if `isLoading` is true,
  // and only use local state for editing after loading is done.
  // Let's initialize local state only once, and then update it when loading finishes OR when specific fields change if we want live updates.
  // To avoid the linter error, we shouldn't set state in render/effect synchronously if it triggers a loop.
  // But here it's conditional. The linter is strict.
  
  // Refactor: Instead of effect, we can just use `profile` directly for rendering if `isLoading` is true.
  // And only initialize `editedProfile` when `isLoading` becomes false (completion).
  // But the user wants to see "what LLM is doing", i.e., the fields filling up.
  // So we should display `profile` (from stream) when loading, and `editedProfile` when not loading?
  // Or keep syncing them.
  
  // We can merge the incoming profile with our local state.
  // But React does not like setting state during an effect if it triggers an update loop.
  // However, this dependency array only includes isLoading.
  // So it will only run ONCE when isLoading flips from true -> false (actually twice, once for true, once for false).
  // When it flips to false (done), we want to sync the final state.
  
  useEffect(() => {
    if (!isLoading && profile) {
        // Sync state when loading is done so user can edit the FINAL result
        setEditedProfile(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); 

  const handleConfirm = () => {
    // Cast to full profile (validation could go here)
    onConfirm(editedProfile as BusinessProfile);
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const current = editedProfile.keywords || [];
    if (!current.includes(newKeyword.trim())) {
      setEditedProfile({ ...editedProfile, keywords: [...current, newKeyword.trim()] });
    }
    setNewKeyword('');
  };

  const removeKeyword = (k: string) => {
    const current = editedProfile.keywords || [];
    setEditedProfile({ ...editedProfile, keywords: current.filter((w) => w !== k) });
  };

  const updateField = (field: keyof BusinessProfile, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  // Use displayProfile for rendering values to show live updates
  const currentProfile = (isLoading ? profile : editedProfile) || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Card className="bg-white/80 backdrop-blur-sm border-zinc-200 shadow-lg relative overflow-hidden">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100">
            <div className="h-full bg-zinc-900 animate-progress-indeterminate origin-left"></div>
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isLoading ? 'Analyzing Business...' : 'Review Search Profile'}
          </CardTitle>
          <CardDescription>
            {isLoading 
              ? 'Our AI is extracting key details from your description. Watch it work!' 
              : 'Adjust the "dials" below to fine-tune your influencer search.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input 
                value={currentProfile.industry || ''} 
                onChange={(e) => updateField('industry', e.target.value)}
                placeholder={isLoading ? "Detecting..." : "e.g. Sustainable Fashion"}
                className="bg-white"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Location</Label>
              <Input 
                value={currentProfile.location || ''} 
                onChange={(e) => updateField('location', e.target.value)}
                placeholder={isLoading ? "Detecting..." : "e.g. US, UK, Global"}
                className="bg-white"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Customer</Label>
            <Input 
              value={currentProfile.targetCustomer || ''} 
              onChange={(e) => updateField('targetCustomer', e.target.value)}
              placeholder="e.g. Eco-conscious millennials"
              className="bg-white"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords & Topics</Label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
              {(currentProfile.keywords || []).map((k) => (
                <Badge key={k} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  {k}
                  <button onClick={() => removeKeyword(k)} className="hover:bg-zinc-200 rounded-full p-0.5" disabled={isLoading}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {isLoading && (currentProfile.keywords || []).length === 0 && (
                <span className="text-sm text-zinc-400 italic">Extracting keywords...</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add a keyword..."
                className="flex-1 bg-white"
                disabled={isLoading}
              />
              <Button size="icon" variant="outline" onClick={addKeyword} disabled={isLoading}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isLoading && (
            <div className="pt-4 flex justify-end">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-zinc-900 text-white shadow-lg hover:scale-105 transition-transform"
                onClick={handleConfirm}
              >
                Start Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
