// lib/ai/cover-letter-generator.ts
import { model, generationConfig, safetySettings } from './gemini';
import { ResumeData } from '@/types/resume'; // Assuming you'll pass the resume data

interface GenerateCoverLetterPayload {
  resumeData: Partial<ResumeData>; // Pass the relevant parts of the resume
  jobTitle: string;
  companyName: string;
  specificPoints?: string; // Optional: User-provided points to emphasize
  tone?: 'formal' | 'semi-formal' | 'enthusiastic'; // Optional: tone for the letter
}

interface GeneratedCoverLetterOutput {
  coverLetterText: string;
  // suggestions?: string[]; // Optional: suggestions for improvement or customization
}

// Helper to quickly summarize resume for the prompt
function summarizeResumeForCoverLetter(resumeData: Partial<ResumeData>): string {
  let summary = "Key qualifications include: ";
  if (resumeData.personalInfo?.summary) {
    summary += `Professional Summary: ${resumeData.personalInfo.summary.substring(0, 200)}... `;
  }
  if (resumeData.experience && resumeData.experience.length > 0) {
    const topExperience = resumeData.experience[0];
    summary += `Recent experience as ${topExperience.position} at ${topExperience.company}. `;
  }
  if (resumeData.skills && resumeData.skills.length > 0) {
    summary += `Top skills: ${resumeData.skills.slice(0, 5).map(s => s.name).join(', ')}. `;
  }
  return summary;
}


export async function generateCoverLetter(
  payload: GenerateCoverLetterPayload
): Promise<GeneratedCoverLetterOutput> {
  const { resumeData, jobTitle, companyName, specificPoints, tone = 'semi-formal' } = payload;

  const resumeSummary = summarizeResumeForCoverLetter(resumeData);

  let promptContext = `The candidate's resume highlights: ${resumeSummary}\n`;
  if (specificPoints) {
    promptContext += `The candidate wants to specifically emphasize: "${specificPoints}".\n`;
  }

  const prompt = `
    You are an expert career advisor and professional writer.
    Generate a compelling and tailored cover letter based on the following information.
    The candidate is applying for the role of "${jobTitle}" at "${companyName}".
    The desired tone for the cover letter is "${tone}".

    ${promptContext}

    The cover letter should:
    1.  Start with a professional greeting. If a hiring manager name is not provided, use a generic professional greeting.
    2.  Clearly state the position being applied for and where it was seen (if applicable, otherwise omit).
    3.  Briefly introduce the candidate and express strong interest in the role and company.
    4.  Highlight 2-3 key skills or experiences from the candidate's resume summary that directly align with the target job title.
    5.  If specific points to emphasize were provided, weave them naturally into the letter.
    6.  Show enthusiasm for the specific company, "${companyName}". Briefly mention why the company is a good fit or what excites the candidate about it (you can make a plausible inference if not specified).
    7.  Conclude with a call to action, expressing eagerness for an interview.
    8.  End with a professional closing.

    The candidate's name is ${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}.
    Their contact email is ${resumeData.personalInfo?.email || '[Candidate Email]'} and phone is ${resumeData.personalInfo?.phone || '[Candidate Phone]'}.
    Include the candidate's name and contact information at the end of the letter or in a standard letterhead format if you can represent that in text.

    Output MUST be a valid JSON object with the following structure:
    \`\`\`json
    {
      "coverLetterText": "The full text of the generated cover letter here, formatted with paragraphs (use \\n for newlines)."
    }
    \`\`\`
    Ensure the "coverLetterText" is a single string with appropriate newline characters for formatting.
    Do not include any explanatory text or markdown formatting outside the JSON object.
  `;

  try {
    // Adjust generationConfig if not expecting JSON directly for this, or keep it
    const customGenerationConfig = { ...generationConfig, responseMimeType: "application/json" }; // Ensure JSON output
    const chatSession = model.startChat({ generationConfig: customGenerationConfig, safetySettings, history: [] });
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    console.log("[Cover Letter Generator] Gemini Raw Response:", responseText);

    let cleanedJsonText = responseText.trim();
    // Basic cleaning, assuming responseMimeType: "application/json" works well
    const jsonMatch = cleanedJsonText.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) {
        cleanedJsonText = jsonMatch[0];
    } else {
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
        cleanedJsonText = cleanedJsonText.trim();
    }


    if (!cleanedJsonText) {
        throw new Error("Cleaned JSON text for cover letter is empty from AI.");
    }
    const parsedResult = JSON.parse(cleanedJsonText) as GeneratedCoverLetterOutput;

    if (!parsedResult.coverLetterText) {
      throw new Error("AI response for cover letter is missing 'coverLetterText' field.");
    }
    return parsedResult;

  } catch (error) {
    console.error("Error generating cover letter with AI:", error);
    return {
      coverLetterText: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${companyName}. (AI generation failed, please write manually or try again.)\n\nSincerely,\n${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`,
    };
  }
}