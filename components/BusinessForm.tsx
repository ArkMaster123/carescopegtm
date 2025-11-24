'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessFormProps {
  onSubmit: (description: string) => Promise<void>;
  isLoading: boolean;
}

export function BusinessForm({ onSubmit, isLoading }: BusinessFormProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    await onSubmit(description);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-zinc-100">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Describe Your Business</CardTitle>
        <CardDescription className="text-lg text-zinc-600 mt-2">
          Tell us about your brand, target audience, and goals. Our AI will find the perfect nano-influencers for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-zinc-700">
              Business Description
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., We are a sustainable coffee brand based in Seattle, targeting eco-conscious millennials who love outdoor adventures..."
              className="min-h-[150px] text-base p-4 resize-none focus:ring-2 focus:ring-zinc-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-base py-6 bg-zinc-900 hover:bg-zinc-800 text-white"
            disabled={isLoading || !description.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Find Influencers'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
