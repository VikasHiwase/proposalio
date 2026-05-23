import { useState } from "react";
import Landing from "./pages/Landing";
import Generator from "./pages/Generator";

export default function App() {
  const [page, setPage] = useState("landing");
  const [activeTool, setActiveTool] = useState("proposal");

  function handleGetStarted(toolId) {
    setActiveTool(toolId);
    setPage("generator");
  }

  return (
    <div>
      {page === "landing" && (
        <Landing onGetStarted={handleGetStarted} />
      )}
      {page === "generator" && (
        <Generator
          toolId={activeTool}
          onBack={() => setPage("landing")}
        />
      )}
    </div>
  );
}