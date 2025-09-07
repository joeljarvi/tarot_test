"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function sendMessage(history: any[], message: string) {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history,
  });

  const response = await chat.sendMessage({ message });

  return response.text;
}
