// lib/ai/summary-enhancer.ts
import { model, generationConfig, safetySettings } from './gemini';

interface EnhanceSummaryPayload {
  currentSummary: string;
  resumeTitle?: string; // For context
  // You could add targetJobTitle, keySkills from resume for more context
}

interface EnhancedSummaryOutput {
  enhancedSummary: string;
  // suggestions?: string[]; // Optional: suggestions on what was improved
}

export async function enhanceSummary(
  payload: EnhanceSummaryPayload
): Promise<EnhancedSummaryOutput> {
  const { currentSummary, resumeTitle } = payload;

  let contextText = "The user is writing a professional summary for their resume";
  if (resumeTitle) contextText += ` titled "${resumeTitle}"`;
  contextText += ".";

  const prompt = `
    You are an expert resume writing assistant.
    ${contextText}
    The user has provided the following draft for their professional summary:

    Current Summary:
    "${currentSummary}"

    Task:
    Rewrite this "Current Summary" to be more impactful, concise (ideally 2-4 powerful sentences), and ATS-friendly. 
    Focus on highlighting key skills, quantifiable achievements (if inferable or generally applicable), and career aspirations relevant to a professional resume.
    Ensure the tone is professional and confident.

    Output MUST be a valid JSON object with the following structure:
    \`\`\`json
    {
      "enhancedSummary": "The rewritten, impactful professional summary here."
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

    console.log("[Summary Enhancer] Gemini Raw Response:", responseText);

    let cleanedJsonText = responseText.trim();
    const jsonMatch = cleanedJsonText.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) cleanedJsonText = jsonMatch[0];
    else { 
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
        cleanedJsonText = cleanedJsonText.trim();
    }

    console.log("[Summary Enhancer] Cleaned JSON:", cleanedJsonText);
    if (!cleanedJsonText) throw new Error("Cleaned JSON text is empty from AI for summary.");

    const parsedResult = JSON.parse(cleanedJsonText) as EnhancedSummaryOutput;

    if (!parsedResult.enhancedSummary) {
      throw new Error("AI response for summary enhancement is missing 'enhancedSummary' field.");
    }
    return parsedResult;

  } catch (error) {
    console.error("Error enhancing summary with AI:", error);
    return {
      enhancedSummary: currentSummary + " (AI enhancement failed, please review manually)",
    };
  }
}