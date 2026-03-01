
'use server';
/**
 * @fileOverview A Genkit flow for securely dispatching safety alerts via Twilio.
 *
 * - silentAlarmDispatch - A function that handles SMS and Voice Call alerts.
 * - SilentAlarmDispatchInput - The input type for the silentAlarmDispatch function.
 * - SilentAlarmDispatchOutput - The return type for the silentAlarmDispatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SilentAlarmDispatchInputSchema = z.object({
  contacts: z.array(
    z.object({
      id: z.string().describe('The unique identifier for the contact.'),
      name: z.string().describe('The name of the trusted contact.'),
      phoneNumber: z.string().describe('The phone number of the trusted contact.'),
    })
  ).describe('A list of trusted contacts to notify.'),
  message: z.string().describe('The message content for the SMS alert.'),
  userName: z.string().describe('The name of the user triggering the alarm.'),
  locationUrl: z.string().optional().describe('A URL to the user\'s current location (e.g., Google Maps).'),
});
export type SilentAlarmDispatchInput = z.infer<typeof SilentAlarmDispatchInputSchema>;

const SilentAlarmDispatchOutputSchema = z.object({
  results: z.array(
    z.object({
      contactId: z.string(),
      smsSuccess: z.boolean(),
      callSuccess: z.boolean(),
      error: z.string().optional(),
    })
  ).describe('Results of the dispatch for each contact.'),
});
export type SilentAlarmDispatchOutput = z.infer<typeof SilentAlarmDispatchOutputSchema>;

export async function silentAlarmDispatch(
  input: SilentAlarmDispatchInput
): Promise<SilentAlarmDispatchOutput> {
  return silentAlarmDispatchFlow(input);
}

const silentAlarmDispatchFlow = ai.defineFlow(
  {
    name: 'silentAlarmDispatchFlow',
    inputSchema: SilentAlarmDispatchInputSchema,
    outputSchema: SilentAlarmDispatchOutputSchema,
  },
  async input => {
    // Dynamic import to avoid issues in non-node environments
    const twilio = (await import('twilio')).default;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error('Twilio credentials not configured in environment.');
    }

    const client = twilio(accountSid, authToken);

    const results = await Promise.all(
      input.contacts.map(async contact => {
        let smsSuccess = false;
        let callSuccess = false;
        let errorMsg = '';

        try {
          // 1. Send SMS
          const smsBody = `${input.message}${input.locationUrl ? `\nMy location: ${input.locationUrl}` : ''}`;
          await client.messages.create({
            body: smsBody,
            to: contact.phoneNumber,
            from: twilioNumber,
          });
          smsSuccess = true;

          // 2. Trigger Voice Call
          await client.calls.create({
            twiml: `<Response><Say>Hello ${contact.name}, this is an automated safety alert from UAlright. ${input.userName} has triggered a silent alarm and may be in distress. Please check your text messages for their current location and status immediately.</Say></Response>`,
            to: contact.phoneNumber,
            from: twilioNumber,
          });
          callSuccess = true;
        } catch (e: any) {
          errorMsg = e.message || 'Unknown Twilio error';
        }

        return {
          contactId: contact.id,
          smsSuccess,
          callSuccess,
          error: errorMsg || undefined,
        };
      })
    );

    return {results};
  }
);
