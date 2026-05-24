import OpenAI from "openai";

const groqClient = new OpenAI({
  apiKey: "your_api_key_here",
  baseURL: "https://api.groq.com/openai/v1"
});

async function test() {
  try {
    const result = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: "You respond in JSON" }, { role: "user", content: "Test JSON" }],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 6000,
    });
    console.log("Success:", result.choices[0].message.content);
  } catch (e: any) {
    console.error("Error status:", e?.status);
    console.error("Error message:", e?.message);
    console.error("Error response:", JSON.stringify(e?.response?.data || e?.error, null, 2));
  }
}
test();
