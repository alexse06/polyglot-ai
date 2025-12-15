class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;

        const channelData = input[0];
        for (let i = 0; i < channelData.length; i++) {
            // Simple downsampling/buffering could happen here, 
            // but typically we just pass raw float32 to main thread to convert to PCM16
            // for better control. Check if we want to send every chunk.
            // For efficiency, we can just message the main thread with the input.
            // Gemini expects 16kHz. Browser is usually 44.1/48kHz.
            // We'll just push data to port.
        }

        // Performance: Don't clone excessively.
        // We send the raw float channel data.
        this.port.postMessage(channelData);

        return true;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
