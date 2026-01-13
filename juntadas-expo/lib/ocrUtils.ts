import { Platform } from 'react-native';

export interface OCRResult {
    text: string;
    amount?: number;
    date?: string;
    merchant?: string;
}

const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

/**
 * Processes an image using Google Cloud Vision API and extracts relevant data.
 * @param imageUri The URI of the image to process.
 * @param onProgress Optional callback for progress updates (0-1).
 * @returns Promise resolving to the extracted data.
 */
export async function processReceipt(
    imageUri: string,
    onProgress?: (progress: number) => void
): Promise<OCRResult> {
    if (!GOOGLE_VISION_API_KEY) {
        throw new Error("Missing Google Cloud Vision API Key in environment variables.");
    }

    try {
        if (onProgress) onProgress(0.2);

        // Convert URI to Base64 for the API
        // For Expo, we might need expo-file-system if URI is a local file
        // However, ImagePicker usually gives a URI that can be fetched
        const base64Image = await imageToBase64(imageUri);

        if (onProgress) onProgress(0.5);

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: {
                                content: base64Image,
                            },
                            features: [
                                {
                                    type: 'TEXT_DETECTION',
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (onProgress) onProgress(0.8);

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error.message || "Error from Google Vision API");
        }

        const text = result.responses[0]?.fullTextAnnotation?.text || "";
        const amount = extractAmount(text);

        if (onProgress) onProgress(1.0);

        return {
            text,
            amount
        };
    } catch (e) {
        console.error("OCR Failed:", e);
        throw e;
    }
}

async function imageToBase64(uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function extractAmount(text: string): number | undefined {
    // Matches numbers with optional thousands separators and mandatory decimal separators
    // Support: 1,234.56, 1.234,56, 1234.56, 1234,56, 123.5, 123,5
    // Also captures simple integers if they are likely prices (but prioritizing decimals)
    const priceRegex = /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}\b|\b\d{1,5}\b/g;
    const matches = text.match(priceRegex);

    if (!matches || matches.length === 0) return undefined;

    // Convert matches to numbers
    const validNumbers = matches.map(raw => {
        let normalized = raw;
        // If it has both . and , (e.g., 1.234,56)
        if (raw.includes('.') && raw.includes(',')) {
            if (raw.indexOf(',') > raw.indexOf('.')) {
                // 1.234,56 -> 1234.56
                normalized = raw.replace(/\./g, '').replace(',', '.');
            } else {
                // 1,234.56 -> 1234.56
                normalized = raw.replace(/,/g, '');
            }
        } else if (raw.includes(',')) {
            // 1234,56 -> 1234.56
            normalized = raw.replace(',', '.');
        }

        const val = parseFloat(normalized);
        return isNaN(val) ? 0 : val;
    }).filter(n => n > 0 && n < 100000);

    if (validNumbers.length === 0) return undefined;

    // Simple heuristic: Max value usually is the Total
    return Math.max(...validNumbers);
}
