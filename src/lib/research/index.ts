export interface ResearchNote {
  query: string;
  status: "unavailable" | "preliminary";
  detail: string;
}

export interface ResearchProvider {
  name: string;
  search(query: string): Promise<ResearchNote>;
}

export class UnavailableResearchProvider implements ResearchProvider {
  name = "none";

  async search(query: string): Promise<ResearchNote> {
    return {
      query,
      status: "unavailable",
      detail:
        "No web-research provider is configured. Results are preliminary brainstorming only. Add a research adapter later; do not treat generated gaps as proven.",
    };
  }
}

export class MockResearchProvider implements ResearchProvider {
  name = "mock";

  async search(query: string): Promise<ResearchNote> {
    return {
      query,
      status: "preliminary",
      detail: `Mock research adapter received query “${query.slice(0, 120)}”. No papers, URLs, or citations were retrieved. Treat every gap as a hypothesis.`,
    };
  }
}

export function getResearchProvider(): ResearchProvider {
  const mode = process.env.RESEARCH_PROVIDER ?? "none";
  if (mode === "mock") return new MockResearchProvider();
  return new UnavailableResearchProvider();
}
