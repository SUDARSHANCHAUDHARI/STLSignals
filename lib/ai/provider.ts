import OpenAI from "openai";
import { z } from "zod";
import type { RawPost, ResearchPacket, Signal, TopicCluster } from "@/lib/data/types";
import { inferTopic } from "@/lib/services/signal-scorer";
import { sourceAttribution } from "@/lib/utils/safety";
import { slugify } from "@/lib/utils/slug";

// ─── Schemas ────────────────────────────────────────────────────────────────

const DraftSchema = z.object({
  title: z.string().min(10),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(20),
  contentMarkdown: z.string().min(200),
  seoTitle: z.string().min(10).max(65),
  seoDescription: z.string().min(20).max(155),
  socialSuggestions: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([])
});

export type GeneratedDraft = z.infer<typeof DraftSchema>;

const RepurposeSchema = z.object({
  platforms: z.array(
    z.object({
      platform: z.enum(["linkedin", "twitter", "reddit", "newsletter", "video_script", "carousel"]),
      content: z.string()
    })
  )
});

export type RepurposeDraftInput = { title: string; excerpt: string; contentMarkdown: string; tags: string[] };
export type PlatformContent = { platform: string; content: string };

const ResearchPacketSchema = z.object({
  trend_summary: z.string(),
  recurring_opinions: z.array(z.string()),
  opposing_viewpoints: z.array(z.string()),
  key_tools: z.array(z.string()),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  technical_concepts: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
  why_it_matters: z.string()
});

const ClusteringSchema = z.object({
  clusters: z.array(
    z.object({
      topic: z.string(),
      label: z.string(),
      keywords: z.array(z.string()),
      postIds: z.array(z.string()),
      confidence: z.number()
    })
  )
});

// ─── Interface ───────────────────────────────────────────────────────────────

export interface AiProvider {
  summarizeSignal(signal: Signal): Promise<string>;
  generateDraft(signal: Signal, researchPacket?: ResearchPacket): Promise<GeneratedDraft>;
  generateResearchPacket(signal: Signal): Promise<ResearchPacket>;
  repurposeDraft(draft: RepurposeDraftInput): Promise<PlatformContent[]>;
  clusterPosts(posts: RawPost[]): Promise<TopicCluster[]>;
  getEmbedding(text: string): Promise<number[]>;
}

export function createAiProvider(): AiProvider {
  if (process.env.MOCK_MODE !== "false" || !process.env.AI_API_KEY) {
    return new MockAiProvider();
  }
  return new OpenAiCompatibleProvider();
}

// ─── Mock provider ───────────────────────────────────────────────────────────

class MockAiProvider implements AiProvider {
  async summarizeSignal(signal: Signal) {
    return `${signal.title}: ${signal.summary} This is original analysis based on metadata, short snippets, and engagement patterns.`;
  }

  async generateResearchPacket(signal: Signal): Promise<ResearchPacket> {
    return {
      trend_summary: signal.summary,
      recurring_opinions: [
        `Teams are actively discussing ${signal.keywords[0] ?? signal.topic}.`,
        `There is growing consensus that this trend impacts productivity and quality.`
      ],
      opposing_viewpoints: [
        "Some engineers argue existing tooling is sufficient.",
        "Concerns exist about complexity vs. marginal gain."
      ],
      key_tools: signal.keywords.slice(0, 4),
      faqs: [
        {
          question: `What is driving interest in ${signal.topic}?`,
          answer: `A combination of AI-assisted development, faster delivery cadences, and community discussion around ${signal.keywords[0] ?? "this topic"}.`
        },
        {
          question: "What should teams do first?",
          answer: "Audit current practices, identify the highest-friction points, and adopt incremental improvements."
        }
      ],
      technical_concepts: signal.keywords.slice(0, 3),
      risks: ["Adopting tooling without clear ownership.", "Complexity creep from over-engineering solutions."],
      opportunities: [
        "Faster feedback loops for engineering teams.",
        `Reduced incident rate via better ${signal.topic} practices.`
      ],
      why_it_matters: signal.suggestedAngle
    };
  }

  async clusterPosts(posts: RawPost[]): Promise<TopicCluster[]> {
    const grouped = new Map<string, RawPost[]>();
    for (const post of posts) {
      const topic = inferTopic(post.title);
      grouped.set(topic, [...(grouped.get(topic) ?? []), post]);
    }
    return [...grouped.entries()].map(([topic, topicPosts]) => ({
      topic,
      label: topic.replace(/-/g, " "),
      keywords: [],
      postIds: topicPosts.map((p) => p.id),
      confidence: 0.7
    }));
  }

  async getEmbedding(_text: string): Promise<number[]> {
    // Return a deterministic mock vector (length 8, normalized)
    return [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  }

  async generateDraft(signal: Signal, researchPacket?: ResearchPacket): Promise<GeneratedDraft> {
    const packet = researchPacket ?? (await this.generateResearchPacket(signal));
    const title = `${signal.title}: A Practical Engineering Brief`;
    return {
      title,
      slug: slugify(title),
      excerpt: signal.suggestedAngle,
      seoTitle: title.slice(0, 65),
      seoDescription: signal.summary.slice(0, 155),
      tags: signal.keywords.slice(0, 5),
      faqs: packet.faqs,
      socialSuggestions: [
        `New STL Signals brief: ${signal.suggestedAngle}`,
        `Engineering trend watch: ${signal.keywords.slice(0, 3).join(", ")}`
      ],
      contentMarkdown: [
        `# ${title}`,
        "",
        `${sourceAttribution()} indicate an emerging pattern: ${packet.trend_summary}`,
        "",
        "## Why It Matters",
        "",
        packet.why_it_matters,
        "",
        "## What Engineers Are Saying",
        "",
        packet.recurring_opinions.map((o) => `- ${o}`).join("\n"),
        "",
        "## Counter-Perspectives",
        "",
        packet.opposing_viewpoints.map((o) => `- ${o}`).join("\n"),
        "",
        "## Practical Takeaways",
        "",
        "- Turn the trend into a review checklist before investing in tooling.",
        "- Keep source context as directional signal, not as copied source material.",
        "- Require human editorial review before publishing.",
        "",
        "## Frequently Asked Questions",
        "",
        ...packet.faqs.flatMap((faq) => [`**${faq.question}**`, "", faq.answer, ""]),
        "## Editorial Safety Note",
        "",
        "This draft is original analysis generated from metadata, short snippets, and aggregate trend signals. It does not quote or reproduce full Reddit posts or comments."
      ].join("\n")
    };
  }

  async repurposeDraft(draft: RepurposeDraftInput): Promise<PlatformContent[]> {
    return [
      {
        platform: "linkedin",
        content: `${draft.title}\n\n${draft.excerpt}\n\nKey topics: ${draft.tags.join(", ")}\n\n#engineering #${draft.tags[0] ?? "tech"}`
      },
      {
        platform: "twitter",
        content: `${draft.excerpt.slice(0, 220)}\n\n${draft.tags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}`
      },
      {
        platform: "reddit",
        content: `${draft.title}\n\n${draft.excerpt}\n\n*This is original analysis — not a copy of any specific post.*`
      },
      {
        platform: "newsletter",
        content: `**This week in engineering trends:** ${draft.title}\n\n${draft.excerpt}\n\n${draft.contentMarkdown.slice(0, 800)}`
      },
      {
        platform: "video_script",
        content: `[INTRO] Today we're covering: ${draft.title}.\n\n[BODY] ${draft.excerpt}\n\n[TAKEAWAY] ${draft.tags.slice(0, 3).join(", ")} are shaping how teams ship software.\n\n[OUTRO] Subscribe for weekly engineering trend briefs.`
      },
      {
        platform: "carousel",
        content: `Slide 1: ${draft.title}\nSlide 2: ${draft.excerpt}\n${draft.tags.map((t, i) => `Slide ${i + 3}: ${t}`).join("\n")}`
      }
    ];
  }
}

// ─── Live OpenAI-compatible provider ────────────────────────────────────────

class OpenAiCompatibleProvider implements AiProvider {
  private client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL
  });

  private get model() {
    return process.env.AI_MODEL ?? "gpt-4o-mini";
  }

  async summarizeSignal(signal: Signal) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "Summarize trend signals using original analysis only. Do not quote or copy full Reddit posts or comments."
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

  async generateResearchPacket(signal: Signal): Promise<ResearchPacket> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Generate a structured research packet JSON for an engineering blog post. Return an object with: trend_summary (string), recurring_opinions (string[]), opposing_viewpoints (string[]), key_tools (string[]), faqs (array of {question,answer}), technical_concepts (string[]), risks (string[]), opportunities (string[]), why_it_matters (string). Base analysis only on the provided signal metadata. Do not copy Reddit content verbatim."
        },
        {
          role: "user",
          content: JSON.stringify({
            title: signal.title,
            topic: signal.topic,
            summary: signal.summary,
            keywords: signal.keywords,
            sourceCount: signal.sourceCount,
            posts: signal.posts.map((p) => ({
              title: p.title,
              subreddit: p.subreddit,
              score: p.score,
              snippet: p.contentSnippet
            }))
          })
        }
      ]
    });
    const raw = response.choices[0]?.message.content ?? "{}";
    return ResearchPacketSchema.parse(JSON.parse(raw));
  }

  async clusterPosts(posts: RawPost[]): Promise<TopicCluster[]> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Group these engineering posts into topic clusters. Return JSON: { "clusters": [{ "topic": "kebab-case-slug", "label": "Human Label", "keywords": ["kw1","kw2"], "postIds": ["id1"], "confidence": 0.85 }] }. Valid topics: quality-engineering, cybersecurity, developer-tooling, ai-workflows, platform-engineering, debugging, performance, architecture. Every post must appear in exactly one cluster.'
        },
        {
          role: "user",
          content: JSON.stringify(
            posts.map((p) => ({ id: p.id, title: p.title, subreddit: p.subreddit, snippet: p.contentSnippet }))
          )
        }
      ]
    });
    const raw = response.choices[0]?.message.content ?? '{"clusters":[]}';
    const parsed = ClusteringSchema.parse(JSON.parse(raw));
    return parsed.clusters;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
    return response.data[0]?.embedding ?? [];
  }

  async generateDraft(signal: Signal, researchPacket?: ResearchPacket): Promise<GeneratedDraft> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Create an original engineering blog draft JSON with fields: title (string), slug (kebab-case string), excerpt (string), contentMarkdown (string), seoTitle (string, max 65 chars), seoDescription (string, max 155 chars), socialSuggestions (string[]), tags (string[], 3-6 topic tags), faqs (array of {question,answer}). Do not copy Reddit posts or comments. Include attribution: "Signals observed from public Reddit discussions". End contentMarkdown with an editorial safety note.'
        },
        {
          role: "user",
          content: JSON.stringify({
            signal: {
              title: signal.title,
              topic: signal.topic,
              summary: signal.summary,
              keywords: signal.keywords,
              suggestedAngle: signal.suggestedAngle
            },
            researchPacket: researchPacket ?? null
          })
        }
      ]
    });
    const raw = response.choices[0]?.message.content ?? "{}";
    return DraftSchema.parse(JSON.parse(raw));
  }

  async repurposeDraft(draft: RepurposeDraftInput): Promise<PlatformContent[]> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Repurpose this engineering blog draft into platform-specific content. Return JSON: { "platforms": [{ "platform": "linkedin"|"twitter"|"reddit"|"newsletter"|"video_script"|"carousel", "content": "..." }] }. Include all 6 platforms. Keep content original — do not reproduce Reddit posts verbatim. Twitter max 280 chars. LinkedIn professional tone. Reddit casual and informative.'
        },
        {
          role: "user",
          content: JSON.stringify(draft)
        }
      ]
    });
    const raw = response.choices[0]?.message.content ?? '{"platforms":[]}';
    const parsed = RepurposeSchema.parse(JSON.parse(raw));
    return parsed.platforms;
  }
}
