import OpenAI from "openai";
import { z } from "zod";
import type { Signal } from "@/lib/data/types";
import { sourceAttribution } from "@/lib/utils/safety";
import { slugify } from "@/lib/utils/slug";

const DraftSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  contentMarkdown: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  socialSuggestions: z.array(z.string())
});

export type GeneratedDraft = z.infer<typeof DraftSchema>;

export interface AiProvider {
  summarizeSignal(signal: Signal): Promise<string>;
  generateDraft(signal: Signal): Promise<GeneratedDraft>;
}

export function createAiProvider(): AiProvider {
  if (process.env.MOCK_MODE !== "false" || !process.env.AI_API_KEY) {
    return new MockAiProvider();
  }
  return new OpenAiCompatibleProvider();
}

class MockAiProvider implements AiProvider {
  async summarizeSignal(signal: Signal) {
    return `${signal.title}: ${signal.summary} This is original analysis based on metadata, short snippets, and engagement patterns.`;
  }

  async generateDraft(signal: Signal) {
    const title = `${signal.title}: A Practical Engineering Brief`;
    return {
      title,
      slug: slugify(title),
      excerpt: signal.suggestedAngle,
      seoTitle: title.slice(0, 65),
      seoDescription: signal.summary.slice(0, 155),
      socialSuggestions: [
        `New STL Signals brief: ${signal.suggestedAngle}`,
        `Engineering trend watch: ${signal.keywords.slice(0, 3).join(", ")}`
      ],
      contentMarkdown: [
        `# ${title}`,
        "",
        `${sourceAttribution()} indicate an emerging pattern: ${signal.summary}`,
        "",
        "## Why It Matters",
        "",
        "The signal is useful because it connects repeated practitioner concerns with concrete engineering workflow changes.",
        "",
        "## Practical Takeaways",
        "",
        "- Turn the trend into a review checklist before investing in tooling.",
        "- Keep source context as directional signal, not as copied source material.",
        "- Require human editorial review before publishing.",
        "",
        "## Editorial Safety Note",
        "",
        "This draft is original analysis generated from metadata, short snippets, and aggregate trend signals. It does not quote or reproduce full Reddit posts or comments."
      ].join("\n")
    };
  }
}

class OpenAiCompatibleProvider implements AiProvider {
  private client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL
  });

  async summarizeSignal(signal: Signal) {
    const response = await this.client.chat.completions.create({
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize trend signals using original analysis only. Do not quote or copy full Reddit posts or comments."
        },
        {
          role: "user",
          content: JSON.stringify({
            title: signal.title,
            topic: signal.topic,
            keywords: signal.keywords,
            sourceCount: signal.sourceCount,
            posts: signal.posts.map((post) => ({
              title: post.title,
              subreddit: post.subreddit,
              score: post.score,
              commentCount: post.commentCount,
              snippet: post.contentSnippet
            }))
          })
        }
      ]
    });

    return response.choices[0]?.message.content ?? signal.summary;
  }

  async generateDraft(signal: Signal) {
    const response = await this.client.chat.completions.create({
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Create an original engineering blog draft in JSON. Include title, slug, excerpt, contentMarkdown, seoTitle, seoDescription, and socialSuggestions. Do not copy Reddit posts or comments. Include attribution: Signals observed from public Reddit discussions. Require human review."
        },
        {
          role: "user",
          content: JSON.stringify(signal)
        }
      ]
    });

    const raw = response.choices[0]?.message.content ?? "{}";
    return DraftSchema.parse(JSON.parse(raw));
  }
}
