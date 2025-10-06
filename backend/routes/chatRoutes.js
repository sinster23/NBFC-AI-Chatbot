import { model } from "../utils/geminiClient.js";
import { runSalesAgent } from "../agents/salesAgent.js";
import { runVerificationAgent } from "../agents/verificationAgent.js";
import { runUnderwritingAgent } from "../agents/underwritingAgent.js";
import { runSanctionAgent } from "../agents/sanctionAgent.js";

export const runMasterAgent = async (userMessage) => {
  const systemPrompt = `
You are the MASTER AI agent for an NBFC (loan provider) company named "QuickCapital". Your name is "Capita AI".
You coordinate 4 worker agents:
1️⃣ Sales Agent – handles product inquiries, pre-approved limits.
2️⃣ Verification Agent – handles identity verification, KYC.
3️⃣ Underwriting Agent – calculates eligibility and risk.
4️⃣ Sanction Agent – generates sanction letter and final approval.

**Your job:** Understand user's message → decide which agent should handle it → call that agent → merge their output into one clean, conversational JSON response.

Example thinking:
- If user asks "Can I get a loan?" → Sales agent
- If user says "Here is my Aadhaar" → Verification agent
- If user says "How much can I get approved for?" → Underwriting agent
- If user says "Please generate my sanction letter" → Sanction agent

Always reply in JSON like:
{
  "reply": "conversation reply",
  "stage": "sales" | "verification" | "underwriting" | "sanction"
}
`;

  // Ask Gemini which stage to go to
  const classificationPrompt = `${systemPrompt}\nUser: ${userMessage}`;
  const result = await model.generateContent(classificationPrompt);
  const text = result.response.text();

  // Try to extract which stage Gemini thinks it is
  let stage = "sales";
  try {
    const parsed = JSON.parse(text);
    stage = parsed.stage || "sales";
  } catch {
    // fallback
    if (userMessage.includes("Aadhar") || userMessage.includes("PAN")) stage = "verification";
    else if (userMessage.includes("eligible")) stage = "underwriting";
    else if (userMessage.includes("sanction")) stage = "sanction";
  }

  // Route to the selected agent
  let agentResponse;
  switch (stage) {
    case "sales":
      agentResponse = await runSalesAgent(userMessage);
      break;
    case "verification":
      agentResponse = await runVerificationAgent(userMessage);
      break;
    case "underwriting":
      agentResponse = await runUnderwritingAgent(userMessage);
      break;
    case "sanction":
      agentResponse = await runSanctionAgent(userMessage);
      break;
    default:
      agentResponse = { reply: "I'm not sure which step this is, can you clarify?" };
  }

  return {
    ...agentResponse,
    stage,
  };
};
