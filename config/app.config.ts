/**
 * SINGLE TUNABLE CONFIG FILE.
 * Edit values here to change attachment limits, generation defaults, and
 * user-facing copy. No other file should hardcode these.
 */

export const APP_CONFIG = {
  brand: {
    name: "Context Generator",
    tagline: "Turn rough ideas into production-grade LLM prompts.",
  },

  attachments: {
    maxFiles: 5,
    maxFileSizeMB: 10,
    maxTotalSizeMB: 25,
    perFileTokenCap: 6_000,
    combinedTokenCap: 3_000,
    summarizeAboveTokens: 2_000,
    summaryTargetTokens: 800,
    chunkTokens: 2_000,
    acceptedExtensions: [".pdf", ".docx", ".xlsx", ".csv"],
    legacyDocMessage:
      "Legacy .doc files aren't supported. Please re-save as .docx and try again.",
  },

  generation: {
    maxOutputTokens: 1_400,
    temperature: 0.4,
    jsonRetryAttempts: 1,
  },

  copy: {
    readyHeadline: "Your context-rich prompt is ready ✨",
  },

  links: {
    support: "/support",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
