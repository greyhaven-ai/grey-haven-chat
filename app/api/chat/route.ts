import { initObservability } from "../../observability";
import { StreamingTextResponse } from "ai";
import { ChatMessage, MessageContent, Anthropic } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createChatEngine } from "./engine";
import { LlamaIndexStream } from "./llamaindex-stream";
import { Ratelimit } from "@unkey/ratelimit";
import { toast } from "../../components/ui/use-toast";
import { supabase } from "../../utils/supabase"; // Import the Supabase client

initObservability();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Define a fallback response in case of timeout or error
const fallbackResponse = {
  success: true, // You can choose to allow or reject requests in case of issues
  limit: 0,
  remaining: 0,
  reset: 0,
};

const unkey = new Ratelimit({
  rootKey: process.env.UNKEY_ROOT_KEY!,
  namespace: process.env.UNKEY_NAMESPACE!,
  limit: 20, 
  duration: "720m", 
  async: true,
  timeout: {
    ms: 3000, // Wait up to 3 seconds for a response from the rate limiting service
    fallback: fallbackResponse, // Use the fallback response if the timeout is reached
  },
  onError: (err) => {
    console.error("Rate limiting error:", err.message);
    return fallbackResponse; // Use the fallback response in case of an error
  },
});

const convertMessageContent = (
  textMessage: string,
  imageUrl: string | undefined,
): MessageContent => {
  if (!imageUrl) return textMessage;
  return [
    {
      type: "text",
      text: textMessage,
    },
    {
      type: "image_url",
      image_url: {
        url: imageUrl,
      },
    },
  ];
};

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") ?? request.ip ?? "unknown";
    console.log(`Incoming request from IP: ${clientIp}`);

    const ratelimit = await unkey.limit(clientIp);
    if (!ratelimit.success) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      toast({
        title: "Rate limit exceeded",
        description: "You have exceeded the rate limit. Please try again later.",
        variant: "default",
      });
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      );
    }

    console.log(`Rate limit for IP ${clientIp}: ${ratelimit.limit}, remaining: ${ratelimit.remaining}, reset: ${ratelimit.reset}`);

    const body = await request.json();
    const { messages, data }: { messages: ChatMessage[]; data: any } = body;
    const userMessage = messages.pop();
    if (!messages || !userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    // Save the user's message to Supabase
    await supabase.from("chat_messages").insert({
      user_message: userMessage.content,
    });

    const llm = new Anthropic({
      model: (process.env.MODEL as any) ?? "claude-3-sonnet",
      temperature: 0.6,
      maxTokens: 512,
    });

    const chatEngine = await createChatEngine(llm);
    
    // Convert message content from Vercel/AI format to LlamaIndex/OpenAI format
    const userMessageContent = convertMessageContent(
      userMessage.content,
      data?.imageUrl,
    );

    // Calling LlamaIndex's ChatEngine to get a streamed response
    const response = await chatEngine.chat({
      message: userMessageContent,
      chatHistory: messages,
      stream: true,
    });

    // Transform LlamaIndex stream to Vercel/AI format
    const { stream, data: streamData } = LlamaIndexStream(response, {
      parserOptions: {
        image_url: data?.imageUrl,
      },
    });

    // Save the assistant's response to Supabase
    const assistantResponseStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          assistantMessage += decoder.decode(value, { stream: true });
          controller.enqueue(value);
        }

        // Save the assistant's message to Supabase
        await supabase.from("chat_messages").insert({
          assistant_message: assistantMessage,
        });

        controller.close();
      },
    });

    // Return a StreamingTextResponse, which can be consumed by the Vercel/AI client
    return new StreamingTextResponse(assistantResponseStream, {}, streamData);
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
