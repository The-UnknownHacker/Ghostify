import { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";
import { z } from "zod";

export const maxDuration = 20;
export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const RequestBodySchema = z.object({
  question: z.string().min(1, { message: "User input is required." }),
});

export const DeepDiveFormat = z.object({
  markdown: z.string(),
});

export type DeepDiveType = z.infer<typeof DeepDiveFormat>;

export type ApiDeepDiveResponse = {
  message: string;
  data: DeepDiveType | null;
  errors?: z.ZodFormattedError<
    {
      userInput: string;
    },
    string
  >;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiDeepDiveResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed", data: null });
  }

  const parseResult = RequestBodySchema.safeParse(req.body);

  if (!parseResult.success) {
    const errors = parseResult.error.format();

    return res.status(400).json({
      message: "Invalid request body.",
      data: null,
      errors,
    });
  }

  const { question } = parseResult.data;

  const prompt = `
  You are a teacher providing a deep dive explanation for a student. 
  Create a detailed markdown explanation with:
  1. Clear headings and subheadings
  2. Bullet points where appropriate
  3. Simple mermaid diagrams if helpful
  4. Code examples if the topic is related to code
  
  Keep the explanation clear, concise, and well-structured.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: `Explain this topic: "${question}"`,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
    });

    // Get the raw markdown content
    const markdownContent = completion.choices[0].message.content || "";

    // Clean up any potential issues
    const cleanedContent = markdownContent
      .replace(/```\s*$/g, "```\n") // Fix unclosed code blocks
      .replace(/\n{3,}/g, "\n\n") // Normalize multiple newlines
      .trim();

    // Create the properly formatted JSON response
    const jsonResponse = {
      markdown: cleanedContent
    };

    let parsedResponse;
    try {
      parsedResponse = DeepDiveFormat.parse(jsonResponse);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Failed to parse content:', jsonResponse);
      return res.status(500).json({
        message: "Failed to parse AI response",
        data: null,
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      });
    }

    res.status(200).json({ message: "All good", data: parsedResponse });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: "AI API error",
      data: null,
      error: error instanceof Error ? error.message : 'Unknown API error'
    });
  }
}
