export default function Landing({ onGetStarted }) {

  const tools = [
    {
      id: "proposal",
      icon: "📄",
      title: "Proposal Generator",
      description: "Win clients with professional proposals in 10 seconds",
      badge: "Most used",
    },
    {
      id: "enquiry",
      icon: "📬",
      title: "Enquiry Responder",
      description: "Reply to client enquiries professionally — never miss a lead",
      badge: "New",
    },
    {
      id: "tender",
      icon: "🏗️",
      title: "Tender / RFP Filler",
      description: "Fill tender requirements and RFP responses in minutes",
      badge: "New",
    },
  ];

  return (
    <div style={{ fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 24px", borderBottom: "1px solid #f0f0f0",
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#2563eb" }}>ProposalIO</span>
        <span style={{ fontSize: 12, color: "#aaa" }}>Free for Indian freelancers</span>
      </nav>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Hero */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25, margin: "0 0 14px", color: "#787a83" }}>
            Every business document<br />
            <span style={{ color: "#2563eb" }}>your agency needs — in seconds</span>
          </h1>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, margin: 0 }}>
            Proposals, enquiry replies, tender fillers — all AI-generated,
            professionally formatted, ready to send.
          </p>
        </div>

        {/* Tool cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "2.5rem" }}>
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onGetStarted(tool.id)}
              style={{
                background: "#fff", border: "1px solid #e5e5e5",
                borderRadius: 12, padding: "1.25rem 1.5rem",
                cursor: "pointer", display: "flex",
                alignItems: "center", gap: 16,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e5e5e5";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: 28 }}>{tool.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{tool.title}</span>
                  {tool.badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px",
                      borderRadius: 20, background: tool.badge === "Most used" ? "#eff6ff" : "#f0fdf4",
                      color: tool.badge === "Most used" ? "#2563eb" : "#16a34a",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{tool.description}</p>
              </div>
              <span style={{ color: "#bbb", fontSize: 18 }}>→</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#aaa" }}>
          No signup required · No credit card · Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
