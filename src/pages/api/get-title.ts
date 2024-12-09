import { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";
import { z } from "zod";

export const maxDuration = 20;
export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const RequestBodySchema = z.object({
  userInput: z.string().min(1, { message: "User input is required." }),
});

export const QuestionAndAnswerFormat = z.object({
  title: z.string(),
  description: z.string(),
});

export type QuestionType = z.infer<typeof QuestionAndAnswerFormat>;

export type ApiGetTitleType = {
  message: string;
  data: { data: QuestionType } | null;
  errors?: z.ZodFormattedError<
    {
      userInput: string;
    },
    string
  >;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiGetTitleType>
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

  const { userInput } = parseResult.data;

  const prompt = `Create a title for the following context that the user will give. Write the title in less than 5 words. Write a short description using less than 20 words. Respond in JSON format with 'title' and 'description' fields.`;
  
  const completion = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `You must create the title and description using this context and respond in JSON: "${userInput}".`,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  let parsedResponse;
  try {
    parsedResponse = QuestionAndAnswerFormat.parse(
      JSON.parse(completion.choices[0].message.content || "{}")
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to parse AI response",
      data: null,
    });
  }

  const response = {
    data: {
      title: parsedResponse.title,
      description: parsedResponse.description,
    },
  };
  
  res.status(200).json({ message: "All good", data: response });
}
