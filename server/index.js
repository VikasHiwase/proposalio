import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

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
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));