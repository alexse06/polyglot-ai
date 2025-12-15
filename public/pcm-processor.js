class PCMProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const float32Tensor = input[0];
            this.port.postMessage(float32Tensor);
        }
        return true;
    }
}
registerProcessor('pcm-processor', PCMProcessor);
