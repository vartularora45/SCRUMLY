import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,   // 🔥 Change key
  baseURL: 'https://api.groq.com/openai/v1', // 🔥 Groq endpoint
});

const SYSTEM_PROMPT = `You are a task extraction AI for a Scrum board. Analyze team messages and extract actionable tasks.

STRICT RULES:
1. Return ONLY valid JSON, no explanation or markdown
2. Extract ONE primary task per message
3. Determine status: DONE (completed), IN_PROGRESS (ongoing), TODO (planned/requested)
4. Confidence: 0-1 scale (how certain you are this is a real task)

RESPONSE FORMAT (EXACT):
{
  "task": "Clear, actionable task title",
  "status": "DONE|IN_PROGRESS|TODO",
  "confidence": 0.95
}

EXAMPLES:
Message: "Just finished the login API endpoint"
Response: {"task": "Implement login API endpoint", "status": "DONE", "confidence": 0.95}

Message: "Working on the dashboard redesign, should be done by Friday"
Response: {"task": "Redesign dashboard UI", "status": "IN_PROGRESS", "confidence": 0.9}

Message: "We need to add error handling to the payment flow"
Response: {"task": "Add error handling to payment flow", "status": "TODO", "confidence": 0.85}

Message: "Hey everyone! How's it going?"
Response: {"task": "Team check-in", "status": "DONE", "confidence": 0.2}`;

export const parseMessageWithAI = async (
  content,
  model = 'llama-3.3-70b-versatile' // 🔥 Groq default model
) => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const responseText = completion.choices[0].message.content.trim();

    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    if (!parsed.task || !parsed.status || parsed.confidence === undefined) {
      throw new Error('Invalid AI response structure');
    }

    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(parsed.status)) {
      throw new Error('Invalid status value');
    }

    if (parsed.confidence < 0 || parsed.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }

    return {
      task: parsed.task,
      status: parsed.status,
      confidence: parsed.confidence,
      success: true,
    };

  } catch (error) {
    console.error('AI Parsing Error:', error.message);

    return {
      task: content.substring(0, 100),
      status: 'TODO',
      confidence: 0.3,
      success: false,
      error: error.message,
    };
  }
};

// Batch processing
export const parseMultipleMessages = async (
  messages,
  model = 'llama-3.3-70b-versatile'
) => {
  const results = await Promise.allSettled(
    messages.map(msg => parseMessageWithAI(msg, model))
  );

  return results.map((result, index) => ({
    messageIndex: index,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
};
