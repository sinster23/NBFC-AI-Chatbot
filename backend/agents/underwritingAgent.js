import fs from "fs";
import path from "path";

const customers = JSON.parse(
  fs.readFileSync(path.resolve("data/customers.json"), "utf-8")
);

export async function runUnderwritingAgent(message) {
  const nameMatch = message.match(/[A-Z][a-z]+\s[A-Z][a-z]+/);
  const name = nameMatch ? nameMatch[0] : customers[0].name;
  const user = customers.find((c) => c.name === name) || customers[0];

  const amountMatch = message.match(/\d+/);
  const loanAmount = amountMatch ? parseInt(amountMatch[0]) : user.preApprovedLimit;

  let decision, reply;

  if (user.creditScore < 700) {
    decision = "rejected";
    reply = `❌ Sorry ${user.name}, your credit score (${user.creditScore}) is below 700.`;
  } else if (loanAmount <= user.preApprovedLimit) {
    decision = "approved";
    reply = `✅ Instant approval for ₹${loanAmount}. Based on your score (${user.creditScore}). Shall I generate your sanction letter?`;
  } else if (loanAmount <= 2 * user.preApprovedLimit) {
    decision = "need_salary_slip";
    reply = `📄 Please upload your latest salary slip. We’ll approve if EMI ≤ 50% of your salary.`;
  } else {
    decision = "rejected";
    reply = `❌ Requested amount ₹${loanAmount} exceeds twice your limit of ₹${user.preApprovedLimit}.`;
  }

  return { reply, decision, user };
}
