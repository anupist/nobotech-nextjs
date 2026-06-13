import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT =
  'You are ShopBot, a friendly AI assistant for ShopHub e-commerce store. Help customers with product questions, recommendations, order status, and general inquiries. Be concise and helpful. If asked about specific products, suggest browsing the store catalog.';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

// In-memory conversation store: sessionId -> messages
const conversations = new Map<string, Message[]>();
const MAX_MESSAGES = 20;

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body as { message?: string; sessionId?: string };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const id = sessionId || crypto.randomUUID();

    // Get or create conversation history
    let history = conversations.get(id) || [
      { role: 'assistant' as const, content: SYSTEM_PROMPT },
    ];

    // Add user message
    history.push({ role: 'user', content: message.trim() });

    // Trim old messages if exceeding limit (keep system prompt)
    if (history.length > MAX_MESSAGES) {
      history = [history[0], ...history.slice(-(MAX_MESSAGES - 1))];
    }

    // Get AI completion
    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: history,
      thinking: { type: 'disabled' },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse || aiResponse.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });

    // Save updated history
    conversations.set(id, history);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId: id,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process your message' },
      { status: 500 }
    );
  }
}
