"use client";

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneCall, Sparkles, Plus, Play, Clock, ChevronRight } from 'lucide-react';
import { aiStagedCallScriptSuggestion } from '@/ai/flows/ai-staged-call-script-suggestion';
import { useToast } from '@/hooks/use-toast';

export default function StagedCallPage() {
  const [scenario, setScenario] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{timeOffsetSeconds: number, cueText: string}[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!scenario) {
      toast({ title: "Please enter a scenario", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await aiStagedCallScriptSuggestion({ scenario });
      setSuggestions(result.scriptCues);
    } catch (error) {
      toast({ title: "Failed to generate cues", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 bg-background font-body">
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Cover Story</h1>
          <p className="text-muted-foreground">Configure staged calls for social cover.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-accent" size={20} />
            AI Script Co-pilot
          </h2>
          <Card className="border-accent/30 shadow-md">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Describe your situation to generate realistic script cues.</p>
              <Textarea 
                placeholder="e.g., A colleague calling to say there's an urgent server issue..." 
                className="bg-muted/30"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground font-bold"
              >
                {isGenerating ? "Crafting script..." : "Generate Timed Cues"}
              </Button>
            </CardContent>
          </Card>

          {suggestions.length > 0 && (
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider opacity-60">Suggested Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((cue, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-accent/10">
                    <div className="flex items-center gap-1 text-accent font-mono text-sm pt-1">
                      <Clock size={14} />
                      {cue.timeOffsetSeconds}s
                    </div>
                    <p className="text-sm font-medium">{cue.cueText}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Save to My Scenarios</Button>
              </CardFooter>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Scenarios</h2>
            <Button variant="ghost" size="sm" className="text-primary flex gap-1 items-center">
              <Plus size={16} /> New
            </Button>
          </div>
          
          <div className="grid gap-4">
            <Card className="hover:border-primary transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Play size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Work Emergency</h3>
                  <p className="text-xs text-muted-foreground">3 script cues • 0:45 duration</p>
                </div>
                <ChevronRight className="text-muted-foreground" size={20} />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Navigation />
    </div>
  );
}
