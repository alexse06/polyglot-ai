class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.bytesWritten = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;

        const channelData = input[0];

        // Append to buffer
        for (let i = 0; i < channelData.length; i++) {
            this.buffer[this.bytesWritten++] = channelData[i];

            // Flush if full
            if (this.bytesWritten >= this.bufferSize) {
                const chunk = this.buffer.slice(0, this.bufferSize);
                const int16Data = this.float32ToInt16(chunk);
                this.port.postMessage(int16Data);
                this.bytesWritten = 0;
            }
        }

        return true;
    }

    float32ToInt16(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
