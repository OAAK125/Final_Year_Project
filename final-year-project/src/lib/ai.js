import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateQuestion(cert, desc, query) {
  const prompt = `Generate exactly ${
    cert.max_questions || 5
  } multiple-choice questions for the ${cert.name} certification.

Certification Details:
- Name: ${cert.name}
- Certification: ${cert.certification_type.name}
- Topic: ${cert.topics.name}
- Short Description: ${desc?.short_description || "Not provided"}
- Long Description: ${desc?.long_description || "Not provided"}

Question Requirements:
- Format options as A., B., C., D.
- Specify exactly one correct answer per question using the letter only (e.g., "B")
- Make questions practical and relevant to real-world scenarios
- Include detailed explanations
- Include relevant sub-topics

Output Format Requirements:
Return ONLY a JSON array of question objects with no additional text, using this exact structure:
[{
    "question_text": "How do you secure traffic from CloudFront to a private S3 origin?",
    "options": [
        "A. Public bucket ACLs",
        "B. OAC/OAI with bucket policy allowing only CloudFront",
        "C. NAT Gateway",
        "D. Direct public access"
    ],
    "correct_answer": ["B"],
    "explanation": "Origin Access Control/Identity restricts S3 access to CloudFront only.",
    "sub_topic": "CloudFront Security"
}]

Important: 
- Do not include any markdown formatting, code blocks, or additional text
- Only return the JSON array, nothing else
- Ensure the JSON is valid and properly formatted
${query || ''}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_text: { type: "string" },
              options: { 
                type: "array",
                items: { type: "string" }
              },
              correct_answer: {
                type: "array",
                items: { type: "string" }
              },
              explanation: { type: "string" },
              sub_topic: { type: "string" }
            },
            required: ["question_text", "options", "correct_answer"]
          }
        }
      },
    });

    const result = response.text;
    
    if (typeof result === 'string') {
      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not extract valid JSON from response");
      }
    }
    
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}