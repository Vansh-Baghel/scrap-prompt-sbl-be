import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in environment variables");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askAI(content: string, question: string): Promise<string> {
  const prompt = `
You are an assistant that answers questions based ONLY on the website content below.

Website Content:
"""
${content}
"""

Question: ${question}

Answer clearly and only if the content supports it. If not present, say you cannot find the answer in the website.
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You answer questions based strictly on provided content." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    return response.choices[0]?.message?.content?.trim() ?? "No answer generated.";
  } catch (err) {
    throw new Error("AI request failed: " + (err as Error).message);
  }
}
