"use client";

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Plus, Play, Clock, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen pb-24 md:pl-20 md:pb-12 bg-background font-body pt-12">
      <Navigation />
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Cover Story</h1>
          <p className="text-muted-foreground">Configure staged calls for social cover.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            AI Script Co-pilot
          </h2>
          <Card className="border-none shadow-xl rounded-[2rem] bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Describe your situation to generate realistic script cues.</p>
              <Textarea 
                placeholder="e.g., A colleague calling to say there's an urgent server issue..." 
                className="bg-muted/20 border-none rounded-2xl min-h-[120px] focus-visible:ring-primary"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full py-7 rounded-2xl font-bold text-lg shadow-xl shadow-primary/10"
              >
                {isGenerating ? "Crafting script..." : "Generate Timed Cues"}
              </Button>
            </CardContent>
          </Card>

          {suggestions.length > 0 && (
            <Card className="border-none shadow-xl rounded-[2rem] bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-widest font-bold opacity-60">Suggested Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((cue, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
                    <div className="flex items-center gap-1 text-primary font-mono text-sm pt-1">
                      <Clock size={14} />
                      {cue.timeOffsetSeconds}s
                    </div>
                    <p className="text-sm font-bold text-foreground/80">{cue.cueText}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full rounded-full py-5 border-primary/20 text-primary font-bold">Save to My Scenarios</Button>
              </CardFooter>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold">Your Scenarios</h2>
            <Button variant="ghost" size="sm" className="text-primary font-bold flex gap-1 items-center rounded-full px-3">
              <Plus size={20} />
            </Button>
          </div>
          
          <div className="grid gap-4">
            <Card className="hover:scale-[1.01] transition-all cursor-pointer group border-none shadow-lg rounded-[2rem]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Play size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Work Emergency</h3>
                  <p className="text-xs text-muted-foreground font-medium">3 script cues • 0:45 duration</p>
                </div>
                <ChevronRight className="text-muted-foreground/30" size={24} />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
