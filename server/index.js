import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

// Strip markdown formatting to avoid ** and __ in output
const stripMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
    .replace(/__(.*?)__/g, '$1')      // Remove __bold__
    .replace(/\*(.*?)\*/g, '$1')      // Remove *italic*
    .replace(/_(.*?)_/g, '$1')        // Remove _italic_
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove [link](url)
    .replace(/`(.*?)`/g, '$1');       // Remove `code`
};

// Health check — useful for deployment later
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/generate-proposal", async (req, res) => {
  const { clientName, projectType, deliverables, timeline, price, yourName } = req.body;

  // Basic validation
  if (!clientName || !projectType || !deliverables || !timeline || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await client.messages.stream({
      model: "claude-opus-4-1",
      max_tokens: 700,
      system: `You are an expert proposal writer for Indian freelancers and agencies.
You write warm, confident, professional proposals that win clients.

Structure every proposal exactly like this:

Subject: [compelling email subject line]

Dear [client name],

[1 paragraph: show you deeply understand their problem and what's at stake for their business]

Here's what I'll deliver:
- [specific deliverable 1]
- [specific deliverable 2]
- [specific deliverable 3]

Timeline: [timeline with brief explanation of what happens when]

Investment: [price] — [one sentence on the value they're getting, not just the cost]

To get started, simply reply to this email and we can schedule a quick 15-minute call to align on the details.

Warm regards,
${yourName || "Your Name"}

---
P.S. [One memorable closing line that reinforces confidence or urgency]`,
      messages: [{
        role: "user",
        content: `Write a proposal for this project:
Client name: ${clientName}
Project type: ${projectType}
What I will deliver: ${deliverables}
Timeline: ${timeline}
My price: ${price}`,
      }],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        const cleanText = stripMarkdown(chunk.delta.text);
        res.write(`data: ${JSON.stringify({ text: cleanText })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (err) {
    console.error("API error:", err.message);
    res.write(`data: ${JSON.stringify({ error: "Generation failed. Please try again." })}\n\n`);
    res.end();
  }
});

// ── Enquiry Responder ────────────────────────────────────
app.post("/api/respond-enquiry", async (req, res) => {
  const { businessName, enquiryText, yourServices, tone, yourName } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await client.messages.stream({
      model: "claude-opus-4-1",
      max_tokens: 700,
      system: `You are a professional business communication expert for Indian agencies and freelancers.
Write a warm, confident reply to a client enquiry.

Structure:
Subject: [relevant subject line]

Dear [client/name if mentioned],

[Acknowledge their enquiry specifically — show you read it carefully]

[Brief introduction of your business and relevant expertise — 2-3 lines]

[What you can offer them specifically — 2-3 bullet points]

[Clear next step — suggest a call or meeting with specific timing]

Warm regards,
${yourName || "Your Name"}
${businessName || ""}

Tone: ${tone || "professional and warm"}
Keep it under 200 words. Sound human, not corporate.`,
      messages: [{
        role: "user",
        content: `Business name: ${businessName}
My services: ${yourServices}
The enquiry I received: ${enquiryText}`,
      }],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        const cleanText = stripMarkdown(chunk.delta.text);
        res.write(`data: ${JSON.stringify({ text: cleanText })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Generation failed." })}\n\n`);
    res.end();
  }
});

// ── Tender / RFP Filler ──────────────────────────────────
app.post("/api/fill-tender", async (req, res) => {
  const { companyName, tenderRequirement, ourExperience, teamSize, yourName } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await client.messages.stream({
      model: "claude-opus-4-1",
      max_tokens: 900,
      system: `You are an expert tender and RFP writer for Indian agencies and service businesses.
Write a professional, compelling tender response.

Structure:
Reference: [Tender/RFP Response]

To Whom It May Concern,

Executive Summary:
[2-3 lines on who we are and why we're the right fit]

Understanding of Requirements:
[Show you've read and understood what they need — be specific]

Our Proposed Approach:
- [Step/phase 1]
- [Step/phase 2]
- [Step/phase 3]

Why Choose Us:
- [Differentiator 1 — based on experience provided]
- [Differentiator 2]
- [Differentiator 3]

Team & Capacity:
[Brief note on team size and relevant expertise]

We welcome the opportunity to discuss this further at your convenience.

Respectfully submitted,
${yourName || "Your Name"}
${companyName || ""}

Be specific, confident, and formal. Under 350 words.`,
      messages: [{
        role: "user",
        content: `Our company: ${companyName}
Tender requirement: ${tenderRequirement}
Our relevant experience: ${ourExperience}
Team size: ${teamSize || "not specified"}`,
      }],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        const cleanText = stripMarkdown(chunk.delta.text);
        res.write(`data: ${JSON.stringify({ text: cleanText })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Generation failed." })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));