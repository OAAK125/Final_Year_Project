import { generateQuestion } from "@/lib/ai";

export async function POST(req) {
  try {
    const { certification, descriptions, aiPrompt } = await req.json();

    const response = await generateQuestion(
      certification,
      descriptions,
      aiPrompt
    );

    let questions = response;
    if (typeof response === 'string') {
      try {
        questions = JSON.parse(response);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
      }
    }

    if (Array.isArray(questions)) {
      return Response.json({ questions: questions }, { status: 200 });
    } else {
      return Response.json({ error: "AI did not return a valid question array" }, { status: 500 });
    }
  } catch (error) {
    console.error("AI error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}