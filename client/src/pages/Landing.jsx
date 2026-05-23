export default function Landing({ onGetStarted }) {
  return (
    <>
      <nav className="landing-nav">
        <span className="brand">
          ProposalIO
        </span>
        <span className="tagline">
          Free for Indian freelancers
        </span>
      </nav>
      <div className="landing-container">

        {/* Header */}
        <div className="landing-header">
          <span className="label">
            Free tool for Indian freelancers
          </span>
          <h1>
            Win more clients with<br />
            <span className="highlight">AI-written proposals</span>
          </h1>
          <p>
            Fill in 5 fields. Get a professional, personalised proposal in 10 seconds.
            No templates. No generic copy. Just proposals that sound like you — on a good day.
          </p>
        </div>

        {/* Social proof */}
        <div className="social-proof">
          Built for designers, developers, marketers, and consultants
          who are tired of staring at a blank page before sending a quote.
        </div>

        {/* How it works */}
        <div className="how-it-works">
          <p className="section-label">
            How it works
          </p>
          {[
            ["1", "Enter your client's name and project details"],
            ["2", "Add your timeline and price"],
            ["3", "Get a full proposal — ready to copy and send"],
          ].map(([num, text]) => (
            <div key={num} className="step">
              <div className="step-number">
                {num}
              </div>
              <p>{text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="cta-button"
        >
          Generate my proposal — it's free
        </button>

        <p className="landing-disclaimer">
          No signup required. No credit card. Just your next winning proposal.
        </p>
      </div>
      <div className="landing-footer">
        <span className="footer-text">
          © 2026 ProposalIO — Built by a freelancer, for freelancers
        </span>
        <span className="footer-text">
          Powered by Claude AI
        </span>
      </div>
    </>
  );
}