// lib/ai/project-enhancer.ts
import { model, generationConfig, safetySettings } from './gemini';

interface EnhanceProjectPayload {
  projectName: string;
  currentDescription: string;
  technologies?: string[];
  resumeTitle?: string; // For context
}

interface EnhancedProjectOutput {
  enhancedDescription: string;
  // suggestions?: string[]; // e.g., suggest adding impact metrics
}

export async function enhanceProjectDescription(
  payload: EnhanceProjectPayload
): Promise<EnhancedProjectOutput> {
  const { projectName, currentDescription, technologies = [], resumeTitle } = payload;

  let contextText = `The user is describing a project named "${projectName}" for their resume`;
  if (resumeTitle) contextText += ` (resume titled "${resumeTitle}")`;
  if (technologies.length > 0) contextText += `. Key technologies used: ${technologies.join(', ')}`;
  contextText += ".";

  const prompt = `
    You are an expert resume writing assistant.
    ${contextText}
    The user has provided the following draft for their project description:

    Current Description:
    "${currentDescription}"

    Task:
    Rewrite this "Current Description" to be more impactful, concise, and clearly articulate the project's purpose, the user's role/contributions, and key outcomes or features. 
    Focus on using strong action verbs and highlighting technical skills demonstrated. If possible, frame contributions in a way that suggests impact.

    Output MUST be a valid JSON object with the following structure:
    \`\`\`json
    {
      "enhancedDescription": "The rewritten, impactful project description here."
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
    console.log("[Project Enhancer] Gemini Raw:", responseText);
    let cleanedJsonText = responseText.trim();
    const jsonMatch = cleanedJsonText.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) cleanedJsonText = jsonMatch[0];
    else { /* ... cleaning logic ... */ 
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
        cleanedJsonText = cleanedJsonText.trim();
    }
    console.log("[Project Enhancer] Cleaned JSON:", cleanedJsonText);
    if (!cleanedJsonText) throw new Error("Cleaned JSON empty from AI for project.");
    const parsedResult = JSON.parse(cleanedJsonText) as EnhancedProjectOutput;
    if (!parsedResult.enhancedDescription) throw new Error("AI response for project enhancement missing 'enhancedDescription'.");
    return parsedResult;
  } catch (error) {
    console.error("Error enhancing project with AI:", error);
    return { enhancedDescription: currentDescription + " (AI enhancement failed, please review manually)" };
  }
}