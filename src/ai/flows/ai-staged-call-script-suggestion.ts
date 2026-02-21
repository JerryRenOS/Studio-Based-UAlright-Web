'use server';
/**
 * @fileOverview A Genkit flow for generating contextual and emotionally resonant timed script cues for staged calls.
 *
 * - aiStagedCallScriptSuggestion - A function that handles the generation of script cues.
 * - StagedCallScriptSuggestionInput - The input type for the aiStagedCallScriptSuggestion function.
 * - StagedCallScriptSuggestionOutput - The return type for the aiStagedCallScriptSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StagedCallScriptSuggestionInputSchema = z.object({
  scenario: z
    .string()
    .describe(
      "A description of the staged call scenario (e.g., 'urgent call from work', 'friend in trouble')."
    ),
});
export type StagedCallScriptSuggestionInput = z.infer<
  typeof StagedCallScriptSuggestionInputSchema
>;

const StagedCallScriptSuggestionOutputSchema = z.object({
  scriptCues: z
    .array(
      z.object({
        timeOffsetSeconds: z
          .number()
          .describe(
            'The time in seconds from the start of the call when this cue should be delivered.'
          ),
        cueText: z.string().describe('The actual line or action the user should take.'),
      })
    )
    .describe('A list of suggested timed script cues for the staged call.'),
});
export type StagedCallScriptSuggestionOutput = z.infer<
  typeof StagedCallScriptSuggestionOutputSchema
>;

export async function aiStagedCallScriptSuggestion(
  input: StagedCallScriptSuggestionInput
): Promise<StagedCallScriptSuggestionOutput> {
  return aiStagedCallScriptSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stagedCallScriptSuggestionPrompt',
  input: {schema: StagedCallScriptSuggestionInputSchema},
  output: {schema: StagedCallScriptSuggestionOutputSchema},
  prompt: `You are an AI assistant specialized in generating realistic and emotionally resonant script cues for staged phone calls. The user is setting up a staged call scenario and needs suggestions for timed script cues to make the call sound authentic and help them navigate it.

Based on the following scenario, generate a list of 3-5 script cues. Each cue should have a 'timeOffsetSeconds' (representing the time in seconds from the start of the call when this cue should be delivered) and 'cueText' (the actual line or action the user should take). Ensure the cues are contextual and evoke the appropriate emotions for the scenario. Provide the output in JSON format, strictly following the output schema.

Scenario: {{{scenario}}}`,
});

const aiStagedCallScriptSuggestionFlow = ai.defineFlow(
  {
    name: 'aiStagedCallScriptSuggestionFlow',
    inputSchema: StagedCallScriptSuggestionInputSchema,
    outputSchema: StagedCallScriptSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
