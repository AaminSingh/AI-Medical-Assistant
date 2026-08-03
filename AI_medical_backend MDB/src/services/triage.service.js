/**
 * Red-flag keyword list — symptoms that may indicate a medical emergency.
 * All keywords are stored in lowercase for case-insensitive matching.
 */
const RED_FLAG_KEYWORDS = [
  "chest pain",
  "breathing difficulty",
  "difficulty breathing",
  "shortness of breath",
  "numbness",
  "severe bleeding",
  "loss of consciousness",
  "unconscious",
  "fainting",
  "seizure",
  "stroke",
  "heart attack",
  "paralysis",
  "choking",
  "suicidal",
  "overdose",
  "severe allergic reaction",
  "anaphylaxis",
];

/**
 * Checks whether the given text contains any red-flag emergency keywords.
 *
 * @param {string} text - The raw symptom description from the user.
 * @returns {boolean} `true` if at least one red-flag keyword is found.
 */
export const checkRedFlags = (text) => {
  if (!text || typeof text !== "string") return false;

  const lowerText = text.toLowerCase();
  return RED_FLAG_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};
