import fs from "fs";
import path from "path";
import { model } from "../utils/geminiClient.js";

const filePath = path.join(process.cwd(), "data", "customers.json");
const customers = JSON.parse(fs.readFileSync(filePath, "utf-8"));

export async function runSalesAgent(message) {
  // Pick a random customer for now
  const customer = customers[Math.floor(Math.random() * customers.length)];

  const prompt = `
You are the SALES AI agent for an NBFC company named "QuickCapital". Your name is "Capita AI". The user says: "${message}".
Customer info: ${JSON.stringify(customer)}

Respond conversationally as a friendly loan officer. Mention their pre-approved limit, interest rate (approx 10-12%), and benefits.
End with a call-to-action to proceed to verification.
Return JSON: { "reply": "..." }
  `;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { reply: text }; // fallback
  }

  return { ...parsed, customer };
}
