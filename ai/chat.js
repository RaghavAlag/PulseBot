const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function chatWithAI(previousMessages, message, onChunk) {
    try {
        const messages = [
            ...previousMessages,
            {
                role: "user",
                content: message
            }
        ];
        const stream = await client.responses.create({
            model: "openai/gpt-oss-20b",
            input: messages,
            stream: true,
        });
        let fullResponse = "";
        for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
                fullResponse += event.delta;
                onChunk(event.delta);
            }
        }
        return fullResponse;
    } catch (error) {
        console.error("AI Streaming Error:", error);

        throw error;
    }
}

module.exports = chatWithAI;