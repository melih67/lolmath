export interface PowerCurvePoint {
  time: number;
  myPower: number;
  enemyPower: number;
}

export interface MatchupAnalysis {
  champion: string;
  opponent: string;
  role: string;
  patch: string;
  winRatePrediction: string;
  runes: {
    keystone: string;
    primaryTree: string[]; // List of rune names
    secondaryTree: string[];
    shards: string[];
    explanation: string; // The math behind the choice
  };
  build: {
    starting: { name: string; reason: string }[];
    core: { name: string; reason: string }[];
    situational: { name: string; reason: string }[];
    explanation: string; // Overall build philosophy
  };
  skills: {
    maxOrder: string[]; // e.g., ["Q", "E", "W"]
    explanation: string; // e.g., "Q gains +40 dmg per rank vs E's +20"
  };
  mathAnalysis: {
    tradingPattern: string;
    efficiencyStats: string; // e.g., "Item build is 108% gold efficient"
  };
  powerCurve: PowerCurvePoint[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ApiResponse {
  data: MatchupAnalysis | null;
  sources: { title: string; url: string }[];
}
