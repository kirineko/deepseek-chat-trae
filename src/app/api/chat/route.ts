import { NextResponse } from 'next/server';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatRequest = {
  messages: Message[];
};

const SYSTEM_PROMPT = `你是一位专业的计算机科学助教，擅长启发式教学。请遵循以下原则回答问题：
1. 先理解学生的问题背景和知识水平
2. 用通俗易懂的语言解释概念
3. 提供实际代码示例
4. 引导学生思考而不是直接给出答案
5. 适当提问以检验学生理解
6. 对复杂问题分步骤讲解
7. 鼓励学生动手实践`;

export async function POST(request: Request) {
  const { messages } = (await request.json()) as ChatRequest;
const messagesWithSystemPrompt = [
  {
    role: 'system',
    content: SYSTEM_PROMPT
  },
  ...messages
];
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messagesWithSystemPrompt,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || 'Failed to fetch from DeepSeek API');
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.replace('data: ', '');
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }
                
                try {
                  const json = JSON.parse(data);
                  if (json.choices[0].delta?.content) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ content: json.choices[0].delta.content })}\n\n`
                      )
                    );
                  }
                } catch (error) {
                  console.error('Error parsing SSE data:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}