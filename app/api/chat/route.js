// ___________________LLAMA AI____________________________________________________
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const systemPrompt = {
  role: "system",
  content: `
  You are a Psychologist. Your task is to act as a therapist and perform therapy. 
  You are not supposed to answer unrelated questions. Redirect back to therapy if the user diverges.
  `,
};

const defaultGreeting = {
  role: "assistant",
  content: "Hi! I'm your therapist. How can I help you today?",
};

export async function POST(req) {
  const { userId } = await auth();
  const { message: userMessage } = await req.json();

  if (!userMessage) {
    return new Response(JSON.stringify({ error: "No message provided" }), {
      status: 400,
    });
  }

  const chatHistoryRef = userId ? doc(db, "chatHistory", userId) : null;
  let existingMessages = [];

  if (chatHistoryRef) {
    const chatSnapshot = await getDoc(chatHistoryRef);
    existingMessages = chatSnapshot.exists() ? chatSnapshot.data().messages : [];
  }

  if (existingMessages.length === 0) {
    existingMessages = [defaultGreeting];
  }

  const updatedMessages = [...existingMessages, { role: "user", content: userMessage }];
  const contextMessages = updatedMessages.slice(-5); // Limit history size
  const aiResponse = await getAIResponse(contextMessages);

  updatedMessages.push({ role: "assistant", content: aiResponse });

  if (chatHistoryRef) {
    await setDoc(chatHistoryRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    });
  }

  return new Response(JSON.stringify({ content: aiResponse }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function getAIResponse(messages) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error from AI API: ${errorData.message}`);
      return "I'm having trouble processing your request. Please try again later.";
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || "Sorry, I couldn't understand your request.";
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred while generating a response. Please try again later.";
  }
}

export async function GET(req) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
    });
  }

  const chatHistoryRef = doc(db, "chatHistory", userId);
  const chatSnapshot = await getDoc(chatHistoryRef);

  if (!chatSnapshot.exists()) {
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
    });
  }

  return new Response(JSON.stringify({ messages: chatSnapshot.data().messages }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// _________________________________________________________
// export async function POST(request) {
//   try {
//     const data = await request.json();

//     // Check if messages is an array
//     if (!Array.isArray(data.messages)) {
//       return NextResponse.json({ error: 'Invalid format: data.messages should be an array' }, { status: 400 });
//     }

//      // Add system prompt as the first message
//  // Add system prompt as the first message
// // const messages = [{ role: 'system', content: systemPrompt }, ...data.messages];
// const messages = [systemPrompt, { role: 'user', content: data.message }];

//     // Prepare the request to OpenRouter API
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // API key for OpenRouter
//         "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000", // Fallback for local testing
//         "X-Title": process.env.YOUR_SITE_NAME || "Local Development", // Fallback for local testing
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "meta-llama/llama-3.1-8b-instruct:free",
//         messages: data.messages,
//       }),
//     });

//     // Check if the response is OK
//     if (!response.ok) {
//       const errorData = await response.json();
//       return NextResponse.json({ error: `Error from OpenRouter: ${errorData.message}` }, { status: response.status });
//     }

//     // Return the response from OpenRouter
//     const result = await response.json();
//     const content = result.choices[0]?.message?.content || 'No content received';

//     return NextResponse.json({ content });

//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }



