import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyBqSWlid-aofnn934hiJRlyM2c1_k8tZe4';

// Define an interface for the expected request body
interface GenerateRequestBody {
  prompt: string;
}

// Check if the API key is available and is a non-empty string
if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== 'string') {
  // Throw a standard Error during server startup if the key is missing or invalid
  throw new Error('GEMINI_API_KEY is not defined or not a string in environment variables.');
}

// Instantiate the GoogleGenerativeAI client (GEMINI_API_KEY is now guaranteed to be a string)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Handles POST requests to /api/generate
 * Expects a JSON body with a 'prompt' field.
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== 'string') {
      throw error(400, "Missing or invalid 'prompt' in request body");
    }

    console.log('Received prompt on backend. Sending to Gemini...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    if (!generatedText) {
      console.error('Gemini API returned an empty response.');
      throw error(500, 'AI failed to generate a response.');
    }

    console.log('Gemini Response Text:', generatedText);

    const cleanedMermaidCode = generatedText.replace(/^```mermaid\n?|\n?```$/g, '').trim();

    return new Response(cleanedMermaidCode, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error_: unknown) {
    console.error('Error during Gemini API call or processing:', error_);

    // Check if it looks like a SvelteKit HttpError (duck typing)
    if (
      typeof error_ === 'object' &&
      error_ !== null &&
      'status' in error_ &&
      typeof error_.status === 'number'
    ) {
      // Safely access the message if it exists
      const message =
        'body' in error_ &&
        typeof error_.body === 'object' &&
        error_.body !== null &&
        'message' in error_.body &&
        typeof error_.body.message === 'string'
          ? error_.body.message
          : 'API Error';

      // Re-throw using SvelteKit's error helper
      throw error(error_.status, message);
    }

    // Handle other potential errors
    let message = 'Unknown error calling AI';
    if (error_ instanceof Error) {
      message = error_.message;
    }

    throw error(500, `Internal Server Error: ${message}`);
  }
};
