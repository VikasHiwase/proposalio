import { useEffect, useState } from "react";
import { downloadProposalAsPDF } from "../utils/generatePDF";

const initialForm = {
  yourName: "",
  clientName: "",
  projectType: "",
  deliverables: "",
  timeline: "",
  price: "",
};

const fields = [
  {
    name: "yourName",
    label: "Your Name",
    placeholder: "e.g. Amit Sharma",
    hint: "Will appear in the proposal signature",
  },
  {
    name: "clientName",
    label: "Client Name",
    placeholder: "e.g. Priya Mehta",
    hint: "The person or business you're pitching to",
  },
  {
    name: "projectType",
    label: "Project Type",
    placeholder: "e.g. E-commerce website for a clothing brand",
    hint: "Be specific — the more detail, the better the proposal",
  },
  {
    name: "deliverables",
    label: "What You Will Deliver",
    placeholder: "e.g. 5-page website, payment integration, mobile responsive, 1 month support",
    hint: "List everything included in your price",
    multiline: true,
  },
  {
    name: "timeline",
    label: "Timeline",
    placeholder: "e.g. 3 weeks",
    hint: "How long will this take you?",
  },
  {
    name: "price",
    label: "Your Price",
    placeholder: "e.g. ₹45,000",
    hint: "State it confidently — the proposal will frame it as value",
  },
];

const toolConfig = {
  proposal: {
    title: "Proposal Generator",
    endpoint: "/api/generate-proposal",
    fields: [
      { name: "yourName", label: "Your Name", placeholder: "e.g. Amit Sharma", hint: "Appears in signature" },
      { name: "clientName", label: "Client Name", placeholder: "e.g. Priya Mehta", hint: "Who you're pitching to", required: true },
      { name: "projectType", label: "Project Type", placeholder: "e.g. E-commerce website", hint: "What they want built", required: true },
      { name: "deliverables", label: "What You Will Deliver", placeholder: "e.g. 5-page site, payment integration", hint: "Everything included", required: true, multiline: true },
      { name: "timeline", label: "Timeline", placeholder: "e.g. 3 weeks", hint: "Realistic delivery time", required: true },
      { name: "price", label: "Your Price", placeholder: "e.g. ₹45,000", hint: "State it confidently", required: true },
    ],
  },
  enquiry: {
    title: "Enquiry Responder",
    endpoint: "/api/respond-enquiry",
    fields: [
      { name: "yourName", label: "Your Name", placeholder: "e.g. Amit Sharma", hint: "Appears in signature" },
      { name: "businessName", label: "Your Business Name", placeholder: "e.g. Amit Design Studio", hint: "Your agency or freelance name" },
      { name: "enquiryText", label: "The Enquiry You Received", placeholder: "Paste the client's enquiry message here...", hint: "Copy paste exactly what they sent you", required: true, multiline: true },
      { name: "yourServices", label: "Your Services", placeholder: "e.g. Web design, mobile apps, branding", hint: "What you offer", required: true },
      { name: "tone", label: "Tone", placeholder: "e.g. Warm and professional", hint: "How should it sound?" },
    ],
  },
  tender: {
    title: "Tender / RFP Filler",
    endpoint: "/api/fill-tender",
    fields: [
      { name: "yourName", label: "Your Name", placeholder: "e.g. Amit Sharma", hint: "Signatory name" },
      { name: "companyName", label: "Your Company Name", placeholder: "e.g. Amit Tech Solutions Pvt Ltd", hint: "Legal or business name" },
      { name: "tenderRequirement", label: "Tender / RFP Requirement", placeholder: "Paste the tender requirements or describe what they're asking for...", hint: "The more detail you give, the better the response", required: true, multiline: true },
      { name: "ourExperience", label: "Your Relevant Experience", placeholder: "e.g. 5 years in web development, built 50+ projects, worked with HDFC, Zomato...", hint: "Highlight what makes you qualified", required: true, multiline: true },
      { name: "teamSize", label: "Team Size", placeholder: "e.g. 8-person team", hint: "Optional but adds credibility" },
    ],
  },
};

export default function Generator({ toolId = "proposal", onBack }) {
  const config = toolConfig[toolId];

  // Build initial form state dynamically from config fields
  const initialForm = Object.fromEntries(config.fields.map((f) => [f.name, ""]));

  const [form, setForm] = useState(initialForm);
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [done, setDone] = useState(false);

  // Reset form when tool changes
  useEffect(() => {
    setForm(Object.fromEntries(config.fields.map((f) => [f.name, ""])));
    setProposal("");
    setDone(false);
    setError(null);
  }, [toolId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const isFormValid = config.fields
    .filter((f) => f.required)
    .every((f) => form[f.name]?.trim().length > 0);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setProposal("");
    setDone(false);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}${config.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.done) { setDone(true); setLoading(false); }
            if (parsed.error) { setError(parsed.error); setLoading(false); }
            if (parsed.text) setProposal((prev) => prev + parsed.text);
          } catch { }
        }
      }
    } catch {
      setError("Cannot connect to server. Make sure it's running on port 3001.");
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleReset() {
    setForm(initialForm);
    setProposal("");
    setDone(false);
    setError(null);
  }

  function handleDownload() {
    downloadProposalAsPDF({
      proposal,
      clientName: form.clientName || form.companyName || "Client",
      yourName: form.yourName,
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <nav className="landing-nav" style={{ marginBottom: 24, marginLeft: -24, marginRight: -24, marginTop: -32 }}>
        <span className="brand">ProposalIO</span>
        <button className="btn-secondary" onClick={onBack}>
          ← Home
        </button>
      </nav>

      {/* Form */}
      <div className="form-container">
        {config.fields.map((f) => (
          <div key={f.name} className="form-group">
            <label>
              {f.label}
              {f.name !== "yourName" && <span className="required">*</span>}
            </label>
            <p className="form-hint">{f.hint}</p>
            {f.multiline ? (
              <textarea
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
              />
            ) : (
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}

        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 24 }}
          onClick={handleGenerate}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{
                width: 14, height: 14, border: "2px solid #fff",
                borderTopColor: "transparent", borderRadius: "50%",
                display: "inline-block", animation: "spin 0.7s linear infinite",
              }} />
              Writing your proposal...
            </span>
          ) : "Generate Proposal"}
        </button>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Output */}
        {(proposal || loading) && (
          <div className="form-container" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#111" }}>
                  {config.title}
                </h1>
                {loading && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                    Claude is writing...
                  </p>
                )}
                {done && (
                  <p style={{ fontSize: 12, color: "var(--success)", margin: 0 }}>
                    ✓ Ready to send
                  </p>
                )}
              </div>

              {done && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn-secondary" onClick={handleReset}>
                    New proposal
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleCopy}
                    style={{
                      background: copied ? "var(--success)" : "linear-gradient(135deg, var(--primary), var(--secondary))",
                    }}
                  >
                    {copied ? "✓ Copied!" : "Copy text"}
                  </button>
                  <button
                    className="btn-accent"
                    onClick={handleDownload}
                    style={{
                      background: downloaded ? "var(--success)" : "var(--accent)",
                    }}
                  >
                    {downloaded ? "✓ Downloaded!" : "Download PDF"}
                  </button>
                </div>
              )}
            </div>

            {/* Proposal text */}
            <div style={{
              background: "var(--bg-secondary)",
              borderRadius: 8,
              padding: "1.25rem",
              minHeight: 100,
              border: "1px solid var(--border)",
            }}>
              <p style={{
                fontSize: 14,
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
                margin: 0,
                color: "var(--text)",
              }}>
                {proposal}
                {loading && (
                  <span style={{
                    display: "inline-block",
                    width: 2,
                    height: 15,
                    background: "var(--primary)",
                    marginLeft: 2,
                    verticalAlign: "middle",
                    animation: "blink 0.9s step-end infinite",
                  }} />
                )}
              </p>
            </div>

            {/* Usage tip */}
            {done && (
              <p style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 12,
                marginBottom: 0,
                lineHeight: 1.6,
              }}>
                💡 Tip: Copy this, paste into Gmail or Outlook, add your portfolio link, and send.
                Most freelancers who use a structured proposal win 2x more projects.
              </p>
            )}
          </div>
        )}

        <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </div>
  );
}

// Subject: Transform Uniglobe Infra's Online Presence with a High-Converting E-commerce Website

// Dear Lokesh,

// I understand that Uniglobe Infra needs more than just an online presence — you need a powerful e-commerce platform that converts visitors into customers 24/7, builds trust with your audience, and scales seamlessly as your business grows. Without a professional, user-friendly website, you're likely losing potential customers to competitors who make it easier for clients to discover and purchase from them online.

// Here's what I'll deliver:
// - A stunning 5-page e-commerce website with product catalog, shopping cart, and secure checkout functionality
// - Complete mobile responsiveness ensuring flawless performance across all devices (70% of buyers shop on mobile!)
// - 1 month of free post-launch support including updates, minor tweaks, and technical assistance

// Timeline: 3 weeks total — Week 1: Design mockups and your approval, Week 2: Development and product integration, Week 3: Testing, optimization, and launch

// Investment: ₹45,000 — You're not just getting a website, you're getting a revenue-generating asset that works for your business round the clock.

// To get started, simply reply to this email and we can schedule a quick 15-minute call to align on the details.

// Warm regards,
// Vikas Hiwase

// ---
// P.S. I have slots opening up next week — let's lock in your project before my calendar fills up for the holiday season!
