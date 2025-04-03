// Google Gemini API integration
const GEMINI_API_KEY = "AIzaSyBDZXshKAn9yy5zkOBDVTHOdDDf4nKFUeE" // This is a placeholder key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export interface AIResponse {
  text: string
  error?: string
}

export async function generateAIResponse(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    const data = await response.json()

    if (data.error) {
      return {
        text: "",
        error: data.error.message || "Error generating AI response",
      }
    }

    // Extract the generated text from the response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return { text: generatedText }
  } catch (error) {
    console.error("AI generation error:", error)
    return {
      text: "",
      error: "Failed to connect to AI service",
    }
  }
}

export async function analyzeFile(fileContent: string, fileType: string): Promise<AIResponse> {
  let prompt = `Analyze this ${fileType} content and provide insights: ${fileContent.substring(0, 5000)}`

  if (fileType === "image") {
    prompt = "This is an image file. Please describe what you see in this image and suggest possible actions or edits."
  }

  return generateAIResponse(prompt)
}

export async function generateCodeFromPrompt(prompt: string, language = "javascript"): Promise<AIResponse> {
  const codePrompt = `Generate ${language} code for: ${prompt}. Only provide the code, no explanations.`
  return generateAIResponse(codePrompt)
}

export async function checkEssayForAI(essay: string): Promise<AIResponse> {
  const prompt = `Analyze this essay and determine if it was written by AI. Provide a percentage likelihood and explain why: ${essay.substring(0, 5000)}`
  return generateAIResponse(prompt)
}

export async function generateEssay(topic: string, length = "medium", style = "academic"): Promise<AIResponse> {
  const prompt = `Write a ${length} ${style} essay about ${topic}.`
  return generateAIResponse(prompt)
}

export async function detectPanelFromText(text: string): Promise<AIResponse> {
  const prompt = `Based on this text: "${text}", determine which panel or feature would be most appropriate to open. Choose from: settings, code, browser, notes, terminal, whiteboard, camera, ai, countdown, music, search, keyboard, ai-text-detection, automation, task-manager, clipboard, file-converter, game, pdf-viewer, calculator, weather, translator, password-manager, color-picker, qr-code, voice-recorder, image-editor, math-solver, flash-cards, regex-tester, habit-tracker, meal-planner, workout-generator, sleep-tracker, music-finder, meme-creator, shopping-assistant, multi-search, weather-dashboard, decision-maker, noise-generator, analytics, quick-access, reverse-image-search, window-resizer, podcast-generator. Only respond with the panel name, nothing else.`
  return generateAIResponse(prompt)
}

export async function detectPanelFromFile(fileName: string, fileType: string): Promise<AIResponse> {
  const prompt = `Based on this file name: "${fileName}" and file type: "${fileType}", determine which panel or feature would be most appropriate to open. Choose from: settings, code, browser, notes, terminal, whiteboard, camera, ai, countdown, music, search, keyboard, ai-text-detection, automation, task-manager, clipboard, file-converter, game, pdf-viewer, calculator, weather, translator, password-manager, color-picker, qr-code, voice-recorder, image-editor, math-solver, flash-cards, regex-tester, habit-tracker, meal-planner, workout-generator, sleep-tracker, music-finder, meme-creator, shopping-assistant, multi-search, weather-dashboard, decision-maker, noise-generator, analytics, quick-access, reverse-image-search, window-resizer, podcast-generator. Only respond with the panel name, nothing else.`
  return generateAIResponse(prompt)
}

export async function generatePanelCode(panelDescription: string): Promise<AIResponse> {
  const prompt = `Create a React component for a panel with the following description: "${panelDescription}". 
  The component should:
  1. Use the 'use client' directive
  2. Import necessary components from @/components/ui
  3. Be a functional component with proper TypeScript typing
  4. Include state management with useState and useEffect hooks
  5. Have a clean UI with proper styling using Tailwind CSS
  6. Include error handling and loading states
  7. Be responsive and accessible
  8. Include comprehensive settings and customization options
  
  Only provide the complete code for the component, nothing else.`
  return generateAIResponse(prompt)
}

export async function generateRegexPattern(description: string): Promise<AIResponse> {
  const prompt = `Generate a regular expression pattern for: ${description}. Include the pattern and a brief explanation of how it works.`
  return generateAIResponse(prompt)
}

export async function generateMeetingMinutes(transcript: string): Promise<AIResponse> {
  const prompt = `Generate meeting minutes from this transcript: ${transcript.substring(0, 5000)}. Include key points, action items, and decisions made.`
  return generateAIResponse(prompt)
}

export async function generateWorkoutRoutine(preferences: string): Promise<AIResponse> {
  const prompt = `Generate a workout routine based on these preferences: ${preferences}. Include exercises, sets, reps, and rest periods.`
  return generateAIResponse(prompt)
}

export async function generateMealPlan(preferences: string): Promise<AIResponse> {
  const prompt = `Generate a meal plan based on these preferences: ${preferences}. Include breakfast, lunch, dinner, and snacks for a week.`
  return generateAIResponse(prompt)
}

export async function checkUsernameAvailability(username: string, platforms: string[]): Promise<AIResponse> {
  const prompt = `Check if the username "${username}" is likely available on these platforms: ${platforms.join(", ")}. This is a hypothetical check, not a real availability check.`
  return generateAIResponse(prompt)
}

export async function generateWallpaper(description: string): Promise<AIResponse> {
  const prompt = `Describe a wallpaper based on this description: ${description}. Include colors, themes, and style.`
  return generateAIResponse(prompt)
}

export async function findSimilarSongs(songDescription: string): Promise<AIResponse> {
  const prompt = `Suggest similar songs based on this description: ${songDescription}. Include artist, song title, and why it's similar.`
  return generateAIResponse(prompt)
}

export async function deepSearchTopic(topic: string): Promise<AIResponse> {
  const prompt = `Provide a comprehensive analysis of this topic: ${topic}. Include key facts, controversies, and expert opinions.`
  return generateAIResponse(prompt)
}

export async function analyzeProductReviews(productName: string): Promise<AIResponse> {
  const prompt = `Analyze reviews for ${productName}. Summarize common pros, cons, and overall sentiment.`
  return generateAIResponse(prompt)
}

export async function makeDecision(options: string[]): Promise<AIResponse> {
  const prompt = `Help make a decision between these options: ${options.join(", ")}. Consider pros and cons of each.`
  return generateAIResponse(prompt)
}

export async function generatePodcastIdeas(topic: string): Promise<AIResponse> {
  const prompt = `Generate podcast episode ideas about ${topic}. Include episode titles and brief descriptions.`
  return generateAIResponse(prompt)
}

export async function emulatePersonality(messages: string, personality: string): Promise<AIResponse> {
  const prompt = `Based on these messages: "${messages}" and this personality description: "${personality}", how would this person respond? Emulate their communication style and likely reaction.`
  return generateAIResponse(prompt)
}

export async function autoDebugCode(code: string, error: string): Promise<AIResponse> {
  const prompt = `Debug this code: ${code}\n\nError: ${error}\n\nExplain the issue and provide a fixed version.`
  return generateAIResponse(prompt)
}

export async function generateApiDocumentation(apiEndpoint: string, parameters: string): Promise<AIResponse> {
  const prompt = `Generate API documentation for this endpoint: ${apiEndpoint} with parameters: ${parameters}. Include request/response examples and parameter descriptions.`
  return generateAIResponse(prompt)
}

export async function generateWebsiteTemplate(description: string): Promise<AIResponse> {
  const prompt = `Generate a website template description based on: ${description}. Include layout, color scheme, and key components.`
  return generateAIResponse(prompt)
}

export async function generateMeetingAgenda(topic: string, duration: string): Promise<AIResponse> {
  const prompt = `Generate a meeting agenda for a ${duration} meeting about ${topic}. Include time allocations for each item.`
  return generateAIResponse(prompt)
}

export async function analyzeScreenshot(description: string): Promise<AIResponse> {
  const prompt = `Based on this description of a screenshot: "${description}", provide analysis and insights.`
  return generateAIResponse(prompt)
}

export async function generateFormResponse(formDescription: string): Promise<AIResponse> {
  const prompt = `Generate appropriate responses for this form: ${formDescription}. Provide realistic but fictional data.`
  return generateAIResponse(prompt)
}

export async function solveEquation(equation: string): Promise<AIResponse> {
  const prompt = `Solve this equation and show steps: ${equation}`
  return generateAIResponse(prompt)
}

export async function balanceChemicalEquation(equation: string): Promise<AIResponse> {
  const prompt = `Balance this chemical equation and explain the process: ${equation}`
  return generateAIResponse(prompt)
}

export async function translateText(text: string, targetLanguage: string): Promise<AIResponse> {
  const prompt = `Translate this text to ${targetLanguage}: ${text}`
  return generateAIResponse(prompt)
}

export async function generateFlashcards(content: string): Promise<AIResponse> {
  const prompt = `Generate flashcards from this content: ${content}. Format as question/answer pairs.`
  return generateAIResponse(prompt)
}

export async function formatCitation(source: string, style: string): Promise<AIResponse> {
  const prompt = `Format this source as a ${style} citation: ${source}`
  return generateAIResponse(prompt)
}

export async function generateQuiz(content: string): Promise<AIResponse> {
  const prompt = `Generate a quiz with multiple-choice questions based on: ${content}. Include answers.`
  return generateAIResponse(prompt)
}

