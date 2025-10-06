import fs from "fs";
import path from "path";
import { generateSanctionPDF } from "../utils/pdfGenerator.js";

const filePath = path.join(process.cwd(), "data", "customers.json");
const customers = JSON.parse(fs.readFileSync(filePath, "utf-8"));

export async function runSanctionAgent(message) {
  const nameMatch = message.match(/[A-Z][a-z]+\s[A-Z][a-z]+/);
  const name = nameMatch ? nameMatch[0] : "Ravi Kumar";
  const user = customers.find((c) => c.name === name) || customers[0];

  const amountMatch = message.match(/\d+/);
  const amount = amountMatch ? parseInt(amount[0]) : user.preApprovedLimit;

  const filePath = generateSanctionPDF(user, amount);

  return {
    reply: `✅ Congratulations ${user.name}! Your loan of ₹${amount.toLocaleString()} has been approved.\nSanction letter: ${filePath}`,
    sanctionLetter: filePath,
    user
  };
}
