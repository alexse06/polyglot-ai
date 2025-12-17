'use server';

export async function getClientSideKey() {
    // WARNING: This exposes the key to the client. 
    // This is necessary for Gemini Multimodal Live API via WebSocket from the browser.
    // In a full production app, you would proxy the WebSocket on the server.
    return process.env.GEMINI_API_KEY;
}
