// lib/ai/experience-enhancer.ts
import { model, generationConfig, safetySettings } from './gemini'; // Your Gemini client setup
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExperienceEntry } from '@/types/resume';

interface EnhanceExperiencePayload {
  description: string;
  achievements?: string[]; // Existing achievements
  title?: string; // Resume title, for context
  jobTitle?: string; // Target job title, for context (optional)
  targetCompanyValues?: string; // <<< NEW FIELD: Comma-separated string of keywords/values
}

interface EnhancedExperienceOutput {
  enhancedDescription: string;
  suggestedAchievements: string[];
}

export async function enhanceExperienceEntry(
  payload: EnhanceExperiencePayload
): Promise<EnhancedExperienceOutput> {
  const { description, achievements = [], title, jobTitle, targetCompanyValues } = payload;

  let contextText = "The user is building a resume";
  if (title) contextText += ` titled "${title}"`;
  if (jobTitle) contextText += ` for a role like "${jobTitle}"`;

  // <<< ADD COMPANY VALUES TO CONTEXT
  if (targetCompanyValues && targetCompanyValues.trim() !== '') {
    contextText += `. They are targeting a company that values: "${targetCompanyValues}". Please try to incorporate or reflect these values subtly in the language and focus of the enhanced content if appropriate.`;
  } else {
    contextText += ".";
  }

  const achievementsText = achievements.length > 0
    ? `Current achievements listed:\n${achievements.map(a => `- ${a}`).join('\n')}`
    : "No specific achievements listed yet for this role.";

  const prompt = `
    You are an expert resume writing assistant specializing in ATS optimization.
    ${contextText}

    The user has provided the following job experience description and (optionally) existing achievements for their role as "${jobTitle || 'a professional'}".

    Current Description:
    "${description}"

    ${achievementsText}

    Task:
    1. Rewrite the "Current Description" to be more impactful, concise, and ATS-friendly. Focus on using strong action verbs and highlighting responsibilities clearly. The rewritten description should be a single paragraph or a few short sentences.
    2. Based on the rewritten description AND considering the target company values (if provided), suggest 3-5 new or refined achievement-oriented bullet points. Each bullet point must start with a strong action verb. Quantify achievements with data or specific examples where possible. If existing achievements were provided, either refine them or suggest entirely new ones that are more impactful.

    Output MUST be a valid JSON object with the following structure:
    \`\`\`json
    {
      "enhancedDescription": "The rewritten job description text here.",
      "suggestedAchievements": [
        "Suggested achievement 1...",
        "Suggested achievement 2...",
        "Suggested achievement 3..."
      ]
    }
    \`\`\`
    Ensure all string values in the JSON are properly escaped.
    Do not include any explanatory text or markdown formatting outside the JSON object.
    Your entire response must start with "{" and end with "}".
  `;

  try {
    const chatSession = model.startChat({ generationConfig, safetySettings, history: [] });
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    console.log("[Experience Enhancer] Gemini Raw Response:", responseText);
    console.log("[Experience Enhancer] Prompt Sent:", prompt); // Log the prompt

    let cleanedJsonText = responseText.trim();
    const jsonMatch = cleanedJsonText.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) cleanedJsonText = jsonMatch[0];
    else {
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
        cleanedJsonText = cleanedJsonText.trim();
    }

    console.log("[Experience Enhancer] Cleaned JSON:", cleanedJsonText);
    if (!cleanedJsonText) throw new Error("Cleaned JSON text is empty from AI.");

    const parsedResult = JSON.parse(cleanedJsonText) as EnhancedExperienceOutput;

    if (!parsedResult.enhancedDescription || !Array.isArray(parsedResult.suggestedAchievements)) {
      throw new Error("AI response for experience enhancement is missing required fields.");
    }
    return parsedResult;

  } catch (error) {
    console.error("Error enhancing experience with AI:", error);
    return {
      enhancedDescription: description + " (AI enhancement failed, please review manually)",
      suggestedAchievements: achievements,
    };
  }
}