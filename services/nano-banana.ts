/**
 * Nano Banana Pro Image API Service (Mock)
 * 
 * This service mocks the image generation capabilities of the Nano Banana Pro API.
 * Since no real API credentials were provided, we simulate the response with high-quality placeholder images.
 */

export interface GeneratedImage {
    url: string;
    width: number;
    height: number;
}

export class NanoBananaService {
    /**
     * Generates images based on a text prompt.
     * @param prompt The text description for the image.
     * @param count Number of images to generate (default: 3).
     * @returns A promise that resolves to an array of generated image URLs.
     */
    static async generateImages(prompt: string, count: number = 3): Promise<string[]> {
        console.log(`[NanoBananaService] Generating ${count} images for prompt: "${prompt}"`);

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return mock images from Unsplash or similar placeholder services that look like "high-res" photos
        // We use different keywords/seeds to ensure variety
        const mockImages = [
            `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80`, // Fashion/Model
            `https://images.unsplash.com/photo-1529139574466-a302d2d3f524?w=800&q=80`, // Aesthetic
            `https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80`, // Street Style
            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80`, // Portrait
            `https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80`, // Moody
        ];

        // Shuffle and pick 'count' images
        const shuffled = mockImages.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
