import { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export const maxDuration = 20;
export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const RequestBodySchema = z.object({
  userInput: z.string().min(1, { message: "User input is required." }),
  type: z.literal("true-or-false").or(z.literal("multiple-choice")),
  difficulty: z.literal("easy").or(z.literal("medium")).or(z.literal("hard")),
  questionAmount: z.number().int().min(1).max(20),
});

export const QuestionAndAnswerFormat = z.object({
  questions: z.array(
    z.object({
      question: z.string(), 
      explanation: z.string(),
      answers: z.array(
        z.object({
          text: z.string(),
          isCorrect: z.boolean(),
          counterArgument: z.string(),
        })
      ),
    })
  ),
});

export type QuestionType = z.infer<
  typeof QuestionAndAnswerFormat
>["questions"][number];

export type ApiGetQuestionsType = {
  message: string;
  data: { questions: QuestionType[] } | null;
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
  res: NextApiResponse<ApiGetQuestionsType>
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

  const { userInput, type, questionAmount, difficulty } = parseResult.data;

  const prompts = [
    `You are a teacher generating ${
      type === "multiple-choice"
        ? "multiple-choice questions with only one correct answer."
        : "true/false questions."
    }`,
    "You need to create an array of questions based on the user's provided input.",
    `Difficulty of the questions should be '${difficulty}', with the complexity of harder questions reflected in length and reasoning.`,
    "Your response must be a valid JSON object with this exact structure:",
    `{
      "questions": [
        {
          "question": "string",
          "explanation": "string",
          "answers": [
            {
              "text": "str ing",
              "correct": boolean,
              "counter_argument": "string"
            }
          ]
        }
      ]
    }`,
    `Generate exactly ${questionAmount} complete questions. For each question, randomly place the correct answer in a different position (0-3). Do not follow any pattern for correct answer placement.`,
    "Ensure each question has exactly one correct answer, placed randomly among the options.",
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompts.join(" "),
        },
        {
          role: "user",
          content: `Create ${questionAmount} questions about: "${userInput}". Return only valid JSON.`,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    console.log('Raw AI response:', completion.choices[0].message.content);

    let parsedResponse;
    try {
      const rawResponse = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Transform the response to match our schema
      const transformedQuestions = rawResponse.questions.map((q: any) => ({
        ...q,
        answers: q.answers.map((a: any) => ({
          text: a.text,
          isCorrect: a.correct, // Map 'correct' to 'isCorrect'
          counterArgument: a.counter_argument || "" // Map 'counter_argument' to 'counterArgument'
        }))
      }));

      parsedResponse = QuestionAndAnswerFormat.parse({
        questions: transformedQuestions
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Failed to parse content:', completion.choices[0].message.content);
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
