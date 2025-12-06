import { NanoBananaService } from '../services/nano-banana';

async function verifyNanoBanana() {
    console.log('--- Verifying Nano Banana Service ---');
    const prompt = "A futuristic city with flying cars";
    console.log(`Generating images for prompt: "${prompt}"...`);

    try {
        const images = await NanoBananaService.generateImages(prompt);
        console.log('Generated Images:', images);

        if (images.length === 3) {
            console.log('SUCCESS: Generated 3 images.');
        } else {
            console.error(`FAILURE: Expected 3 images, got ${images.length}`);
        }

        if (images.every(url => url.startsWith('https://'))) {
            console.log('SUCCESS: All URLs are valid.');
        } else {
            console.error('FAILURE: Invalid URLs detected.');
        }

    } catch (error) {
        console.error('FAILURE: Service threw an error:', error);
    }
}

// We cannot easily verify the API routes (Next.js API) without a running server or mocking the request/response objects.
// However, we can verify the service logic which is the core part.
// The API routes are thin wrappers around the service and Firebase.

async function main() {
    await verifyNanoBanana();
}

main();
