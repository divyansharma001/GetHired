// lib/ai/ats-scorer.ts
import { model, generationConfig, safetySettings } from './gemini'; // Assuming gemini.ts is set up correctly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ResumeData, ATSScoreDetails, PersonalInfo, ExperienceEntry, EducationEntry, SkillEntry, ProjectEntry } from '@/types/resume';

// Helper function to construct a text representation of the resume
function constructResumeText(resumeData: Partial<ResumeData>): string {
  let text = `Resume Title: ${resumeData.title || 'N/A'}\n\n`;
  
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    text += `Personal Information:\n`;
    text += `Name: ${pi.firstName || ''} ${pi.lastName || ''}\n`;
    text += `Email: ${pi.email || ''}\n`;
    text += `Phone: ${pi.phone || ''}\n`;
    text += `Location: ${pi.location || ''}\n`;
    if (pi.linkedin) text += `LinkedIn: ${pi.linkedin}\n`;
    if (pi.website) text += `Website: ${pi.website}\n`;
    text += `Summary: ${pi.summary || 'N/A'}\n\n`;
  }

  if (resumeData.experience && resumeData.experience.length > 0) {
    text += `Experience:\n`;
    resumeData.experience.forEach(exp => {
      text += `- Position: ${exp.position || 'N/A'} at ${exp.company || 'N/A'}\n`;
      text += `  Dates: ${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'}\n`;
      text += `  Description: ${exp.description || 'N/A'}\n`;
      if (exp.achievements && exp.achievements.length > 0) {
        text += `  Achievements:\n${exp.achievements.filter(a => a).map(a => `    * ${a}`).join('\n')}\n`;
      }
    });
    text += `\n`;
  }

  if (resumeData.education && resumeData.education.length > 0) {
    text += `Education:\n`;
    resumeData.education.forEach(edu => {
      text += `- Degree: ${edu.degree || 'N/A'} in ${edu.field || 'N/A'} from ${edu.institution || 'N/A'}\n`;
      text += `  Dates: ${edu.startDate || 'N/A'} - ${edu.endDate || 'N/A'}\n`;
      if (edu.gpa) text += `  GPA: ${edu.gpa}\n`;
      if (edu.achievements && edu.achievements.length > 0) {
        text += `  Achievements:\n${edu.achievements.filter(a => a).map(a => `    * ${a}`).join('\n')}\n`;
      }
    });
    text += `\n`;
  }
  
  if (resumeData.skills && resumeData.skills.length > 0) {
    text += `Skills:\n`;
    resumeData.skills.forEach(skill => {
        text += `- ${skill.name || 'N/A'} (${skill.level || 'N/A'}, ${skill.category || 'N/A'})\n`
    });
    text += `\n`;
  }

  if (resumeData.projects && resumeData.projects.length > 0) {
    text += `Projects:\n`;
    resumeData.projects.forEach(proj => {
        text += `- Name: ${proj.name || 'N/A'}\n Description: ${proj.description || 'N/A'}\n Technologies: ${proj.technologies?.join(', ') || 'N/A'}\n`;
        if(proj.url) text += ` URL: ${proj.url}\n`;
        if(proj.github) text += ` GitHub: ${proj.github}\n`;
    });
  }
  return text.trim();
}

// Define the fallback (default) score structure
const defaultAtsScoreDetails: ATSScoreDetails = {
    overall: 10, // Default low score
    suggestions: ["AI analysis could not be completed. Please ensure your resume has sufficient content and try again."],
    breakdown: {
        keywords: { score: 0, suggestions: ["Content needed for keyword analysis."] },
        clarityAndConciseness: { score: 0, suggestions: ["Content needed for clarity analysis."] },
        actionVerbs: { score: 0, suggestions: ["Content needed for action verb analysis."] },
        quantifiableResults: { score: 0, suggestions: ["Content needed for quantifiable results analysis."] },
        formattingAndConciseness: { score: 0, suggestions: ["Content needed for formatting analysis."] }, // Corrected key
        lengthAndRelevance: { score: 0, suggestions: ["Content needed for length/relevance analysis."] },
    }
};


export async function getAtsScoreAndSuggestions(resumeData: Partial<ResumeData>): Promise<ATSScoreDetails> {
  const resumeTextContent = constructResumeText(resumeData);

  if (!resumeTextContent || resumeTextContent.split('\n').length < 5) { // Basic check for minimal content
    console.warn("[ATS Scorer] Insufficient content for meaningful analysis. Returning default low score.");
    return {
        ...defaultAtsScoreDetails,
        overall: 5,
        suggestions: ["Please add more content to your resume for an accurate ATS score and suggestions."]
    };
  }

 const prompt = `
    You are an expert ATS (Applicant Tracking System) resume analyzer.
    Analyze the following resume content and provide a detailed ATS compatibility assessment.
    The output MUST be a single, valid JSON object adhering strictly to this TypeScript interface:
    \`\`\`typescript
    interface ATSScoreDetails {
      overall: number; // Holistic ATS friendliness score (0-100).
      breakdown?: { 
        keywords: { score: number; suggestions: string[]; }; 
        clarityAndConciseness: { score: number; suggestions: string[]; };
        actionVerbs: { score: number; suggestions: string[]; };
        quantifiableResults: { score: number; suggestions: string[]; };
        formattingAndConciseness: { score: number; suggestions: string[]; };
        lengthAndRelevance: { score: number; suggestions: string[]; };
      }; // End of the 'breakdown' object.
      suggestions: string[]; // <<<<---- VERY IMPORTANT: This is a TOP-LEVEL array for 2-4 concise, actionable, overall suggestions. This 'suggestions' array MUST NOT be inside the 'breakdown' object. It must be a direct property of the root JSON object.
    }
    \`\`\`
    For each category in 'breakdown', provide a 'score' (0-100) and a 'suggestions' array (1-2 concise points, or an empty array if the category is strong).
    The top-level 'suggestions' array is mandatory and should always exist and contain 2-4 high-level improvement points.
    Ensure all string values in the JSON are properly escaped. Do not include any text, markdown (like \`\`\`json\`), or anything else outside the single JSON object itself.
    Your entire response must start with "{" and end with "}".

    Resume Content to Analyze:
    ---
    ${constructResumeText(resumeData)}
    ---
  `;

  let attempt = 0;
  const maxAttempts = 2; 

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const chatSession = model.startChat({
        generationConfig, // Ensure responseMimeType: "application/json" is in gemini.ts
        safetySettings,
        history: [],
      });

      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      
      console.log(`[ATS Scorer Attempt ${attempt}] Gemini Raw Response Text:\n---\n${responseText}\n---`);

      let cleanedJsonText = responseText.trim();
      const jsonMatch = cleanedJsonText.match(/(\{[\s\S]*\})/); // Try to extract content between first { and last }
      if (jsonMatch && jsonMatch[0]) {
          cleanedJsonText = jsonMatch[0];
      } else {
          // Fallback cleaning for common markdown ```json ... ```
          if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
          else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
          if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
          cleanedJsonText = cleanedJsonText.trim();
      }
      
      console.log(`[ATS Scorer Attempt ${attempt}] Cleaned JSON Text for Parsing:\n---\n${cleanedJsonText}\n---`);
      
      if (!cleanedJsonText) {
        throw new Error("Cleaned JSON text is empty after attempting to extract from AI response.");
      }
      
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const parsedAsAny = JSON.parse(cleanedJsonText) as any;

      // ---- START: NORMALIZATION LOGIC (CRUCIAL) ----
      if ((!parsedAsAny.suggestions || !Array.isArray(parsedAsAny.suggestions)) && 
          parsedAsAny.breakdown && 
          Array.isArray(parsedAsAny.breakdown.suggestions)) {
          console.warn("[ATS Scorer] NORMALIZING: Top-level 'suggestions' missing. Moving 'breakdown.suggestions' to top level and deleting from breakdown.");
          parsedAsAny.suggestions = parsedAsAny.breakdown.suggestions;
          delete parsedAsAny.breakdown.suggestions; 
      }
      // ---- END: NORMALIZATION LOGIC ----
      
      const finalResult = parsedAsAny as ATSScoreDetails;

      // Validate essential top-level properties AFTER normalization
      if (typeof finalResult.overall !== 'number' || finalResult.overall < 0 || finalResult.overall > 100 ||
          !finalResult.suggestions || !Array.isArray(finalResult.suggestions) || finalResult.suggestions.length === 0 ) {
          console.error("[ATS Scorer] VALIDATION FAILED: Final JSON missing/invalid 'overall' or TOP-LEVEL 'suggestions'.", finalResult);
          throw new Error("Final JSON does not match structure (overall or top-level suggestions missing, empty, or invalid).");
      }

      // ... (rest of your breakdown validation logic - this should be fine if the above is correct)
      // Ensure defaultAtsScoreDetails and the breakdown validation use "formattingAndConciseness"
      const requiredBreakdownKeys: (keyof NonNullable<ATSScoreDetails['breakdown']>)[] = 
          ["keywords", "clarityAndConciseness", "actionVerbs", "quantifiableResults", "formattingAndConciseness", "lengthAndRelevance"];
      
      if (!finalResult.breakdown) {
        console.warn("[ATS Scorer] AI response missing 'breakdown' object. Providing default breakdown.");
        finalResult.breakdown = { ...defaultAtsScoreDetails.breakdown! };
      } else {
        for (const key of requiredBreakdownKeys) {
            const category = finalResult.breakdown[key];
            if (!category || typeof category.score !== 'number' || category.score < 0 || category.score > 100 || 
                !Array.isArray(category.suggestions)) {
                 console.warn(`[ATS Scorer] Breakdown for '${key}' malformed or missing. Applying default.`);
                 finalResult.breakdown[key] = { ...defaultAtsScoreDetails.breakdown![key]! };
            }
        }
      }
      return finalResult;

    } catch (error) {
      console.error(`[ATS Scorer Attempt ${attempt}] Error parsing or validating JSON:`, error);
      if (attempt >= maxAttempts) {
        console.error("All ATS scoring attempts failed. Returning fallback default score.");
        return defaultAtsScoreDetails;
      }
      // Optional: add a small delay before retrying
      // await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  // This line should theoretically be unreachable if maxAttempts >= 1
  console.error("Exhausted ATS scoring attempts, returning default.");
  return defaultAtsScoreDetails; 
}