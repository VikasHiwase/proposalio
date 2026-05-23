import { useState } from "react";
import Landing from "./pages/Landing";
import Generator from "./pages/Generator";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <div>
      {page === "landing" && (
        <Landing onGetStarted={() => setPage("generator")} />
      )}
      {page === "generator" && (
        <Generator onBack={() => setPage("landing")} />
      )}
    </div>
  );
}