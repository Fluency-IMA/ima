/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gemini AI Service - Core AI Infrastructure
 * Handles all interactions with Google's Gemini API
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Model configurations
const MODEL_CONFIGS = {
    flash: 'gemini-2.0-flash-exp',
    pro: 'gemini-1.5-pro-latest',
} as const;

/**
 * Get Gemini model instance
 */
export function getGeminiModel(modelType: 'flash' | 'pro' = 'flash'): GenerativeModel {
    return genAI.getGenerativeModel({
        model: MODEL_CONFIGS[modelType],
    });
}

/**
 * Generate AI response with retry logic
 */
export async function generateAIResponse(
    prompt: string,
    options: {
        modelType?: 'flash' | 'pro';
        temperature?: number;
        maxTokens?: number;
        systemInstruction?: string;
    } = {}
): Promise<string> {
    const {
        modelType = 'flash',
        temperature = 0.7,
        maxTokens = 8192,
        systemInstruction,
    } = options;

    try {
        const model = getGeminiModel(modelType);

        const generationConfig: GenerationConfig = {
            temperature,
            maxOutputTokens: maxTokens,
        };

        const chat = model.startChat({
            generationConfig,
            history: systemInstruction ? [
                {
                    role: 'user',
                    parts: [{ text: systemInstruction }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I will follow these instructions.' }],
                },
            ] : [],
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            prompt: prompt.substring(0, 100) + '...', // Log first 100 chars
            timestamp: new Date().toISOString()
        });
        throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate structured JSON response
 */
export async function generateStructuredResponse<T>(
    prompt: string,
    schema: string,
    options: {
        modelType?: 'flash' | 'pro';
        temperature?: number;
    } = {}
): Promise<T> {
    const systemInstruction = `You are a JSON API. Always respond with valid JSON matching this schema: ${schema}. Never include markdown formatting or explanations, only raw JSON.`;

    const response = await generateAIResponse(prompt, {
        ...options,
        systemInstruction,
        temperature: options.temperature ?? 0.3, // Lower temperature for structured output
    });

    try {
        // Remove markdown code blocks if present
        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        return JSON.parse(cleanedResponse) as T;
    } catch (error) {
        console.error('Failed to parse AI response as JSON:', response);
        throw new Error('AI returned invalid JSON');
    }
}

/**
 * Batch process multiple prompts
 */
export async function batchGenerate(
    prompts: string[],
    options: {
        modelType?: 'flash' | 'pro';
        temperature?: number;
        concurrency?: number;
    } = {}
): Promise<string[]> {
    const { concurrency = 3 } = options;
    const results: string[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < prompts.length; i += concurrency) {
        const batch = prompts.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(prompt => generateAIResponse(prompt, options))
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Token usage estimation (approximate)
 */
export function estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
}

/**
 * Validate API key
 */
export async function validateAPIKey(): Promise<boolean> {
    try {
        const model = getGeminiModel('flash');
        const result = await model.generateContent('Hello');
        return !!result.response.text();
    } catch (error) {
        console.error('API key validation failed:', error);
        return false;
    }
}

export default {
    getGeminiModel,
    generateAIResponse,
    generateStructuredResponse,
    batchGenerate,
    estimateTokens,
    validateAPIKey,
};
