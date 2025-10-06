import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "customers.json");
const customers = JSON.parse(fs.readFileSync(filePath, "utf-8"));

export async function runVerificationAgent(message) {
  const aadhaarMatch = message.match(/\b\d{12}\b/);
  const panMatch = message.match(/[A-Z]{5}\d{4}[A-Z]{1}/);

  if (!aadhaarMatch || !panMatch) {
    return { reply: "Please provide both Aadhaar (12 digits) and PAN to proceed." };
  }

  const aadhaar = aadhaarMatch[0];
  const pan = panMatch[0];

  const user = customers.find(
    (c) => c.aadhar === aadhaar && c.pan === pan
  );

  if (user) {
    return {
      reply: `✅ KYC verified successfully for ${user.name} (${user.city}). Proceeding to underwriting.`,
      user
    };
  } else {
    return { reply: "❌ KYC verification failed. Aadhaar or PAN not found." };
  }
}
