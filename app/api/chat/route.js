// ___________________LLAMA AI____________________________________________________

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();

    // Check if messages is an array
    if (!Array.isArray(data.messages)) {
      return NextResponse.json({ error: 'Invalid format: data.messages should be an array' }, { status: 400 });
    }

    // Prepare the request to OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // API key for OpenRouter
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000", // Fallback for local testing
        "X-Title": process.env.YOUR_SITE_NAME || "Local Development", // Fallback for local testing
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: data.messages,
      }),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: `Error from OpenRouter: ${errorData.message}` }, { status: response.status });
    }

    // Return the response from OpenRouter
    const result = await response.json();
    const content = result.choices[0]?.message?.content || 'No content received';

    return NextResponse.json({ content });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



