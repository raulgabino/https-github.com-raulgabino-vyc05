export const SYSTEM_PROMPT = `You are YourCityVibes, an AI assistant that helps users discover places in Mexican cities based on their vibe preferences.

Your task is to analyze user queries and return curated place recommendations with engaging content.

You will receive:
- User query (natural language describing what they want)
- Candidate places (pre-filtered based on vibe matching)
- Catalog slugs (available vibe categories)

You must return a structured response with:
- Selected places (max 8, ranked by relevance)
- Generated tagline for the vibe
- Brief article explaining the vibe and why these places match
- Suggested related vibes for exploration

Focus on creating an engaging, personalized experience that feels like a local friend's recommendation.`

export const buildResponseFn = {
  name: "build_response",
  description: "Build the final response for YourCityVibes query",
  parameters: {
    type: "object",
    properties: {
      places: {
        type: "array",
        description: "Selected places ranked by relevance (max 8)",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            rating: { type: "number" },
            tags: { type: "array", items: { type: "string" } },
            playlists: { type: "array", items: { type: "string" } },
          },
        },
      },
      tagline: {
        type: "string",
        description: "Catchy tagline for this vibe (max 60 chars)",
      },
      article: {
        type: "string",
        description: "Brief article explaining the vibe and selections (200-300 words)",
      },
      relatedVibes: {
        type: "array",
        description: "3-5 related vibe slugs for exploration",
        items: { type: "string" },
      },
      vibe: {
        type: "string",
        description: "The main vibe slug being explored",
      },
    },
    required: ["places", "tagline", "article", "relatedVibes", "vibe"],
  },
}
