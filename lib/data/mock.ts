import type { Draft, RawPost, Signal, Source } from "@/lib/data/types";

export const mockSources = [
  {
    id: "src-reddit-qa",
    type: "reddit",
    name: "Quality Engineering",
    subreddit: "QualityAssurance",
    enabled: true,
    keywords: ["qa", "automation", "ci", "flaky tests"],
    scanFrequency: "daily",
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-24T08:00:00.000Z"
  },
  {
    id: "src-reddit-devtools",
    type: "reddit",
    name: "Developer Tooling",
    subreddit: "devops",
    enabled: true,
    keywords: ["platform engineering", "developer experience", "observability"],
    scanFrequency: "twice daily",
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-24T08:00:00.000Z"
  },
  {
    id: "src-reddit-security",
    type: "reddit",
    name: "Security Engineering",
    subreddit: "cybersecurity",
    enabled: false,
    keywords: ["supply chain", "secrets", "sbom"],
    scanFrequency: "weekly",
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-24T08:00:00.000Z"
  }
] satisfies Source[];

export const mockPosts = [
  {
    id: "post-1",
    sourceId: "src-reddit-qa",
    externalId: "mock_qa_001",
    title: "QA teams are rethinking flaky test ownership as AI coding accelerates changes",
    url: "https://www.reddit.com/r/QualityAssurance/comments/mock_qa_001",
    subreddit: "QualityAssurance",
    authorHash: "sha256:demo-1",
    score: 214,
    commentCount: 51,
    createdUtc: "2026-05-24T12:15:00.000Z",
    permalink: "/r/QualityAssurance/comments/mock_qa_001",
    contentSnippet: "Short signal snippet only: teams are discussing ownership, CI noise, and triage workflows.",
    fetchedAt: "2026-05-24T13:00:00.000Z"
  },
  {
    id: "post-2",
    sourceId: "src-reddit-devtools",
    externalId: "mock_devops_001",
    title: "Platform teams want better internal AI tool governance without slowing engineers",
    url: "https://www.reddit.com/r/devops/comments/mock_devops_001",
    subreddit: "devops",
    authorHash: "sha256:demo-2",
    score: 162,
    commentCount: 39,
    createdUtc: "2026-05-24T10:00:00.000Z",
    permalink: "/r/devops/comments/mock_devops_001",
    contentSnippet: "Short signal snippet only: discussion centers on approval workflows, auditability, and DX.",
    fetchedAt: "2026-05-24T13:00:00.000Z"
  },
  {
    id: "post-3",
    sourceId: "src-reddit-security",
    externalId: "mock_sec_001",
    title: "Small teams are adding secret scanning after more AI-generated scripts enter repos",
    url: "https://www.reddit.com/r/cybersecurity/comments/mock_sec_001",
    subreddit: "cybersecurity",
    authorHash: "sha256:demo-3",
    score: 188,
    commentCount: 44,
    createdUtc: "2026-05-23T18:40:00.000Z",
    permalink: "/r/cybersecurity/comments/mock_sec_001",
    contentSnippet: "Short signal snippet only: public thread metadata points to practical guardrails for local tooling.",
    fetchedAt: "2026-05-24T13:00:00.000Z"
  }
] satisfies RawPost[];

export const mockSignals = [
  {
    id: "sig-flaky-tests",
    title: "Flaky test ownership is becoming an AI-era QA priority",
    summary:
      "QA and platform discussions point to a rising need for clear ownership, freshness scoring, and faster triage when AI-assisted changes increase CI churn.",
    topic: "quality-engineering",
    keywords: ["flaky tests", "test ownership", "ci", "ai coding"],
    score: 88,
    confidence: 0.82,
    sourceCount: 2,
    status: "draft_created",
    createdAt: "2026-05-24T13:20:00.000Z",
    updatedAt: "2026-05-24T13:40:00.000Z",
    posts: [mockPosts[0]],
    suggestedAngle: "How QA teams can make flaky test triage resilient to AI-assisted delivery speed."
  },
  {
    id: "sig-ai-governance",
    title: "Internal AI tool governance is moving into developer platform work",
    summary:
      "Developer tooling discussions increasingly frame AI governance as a platform problem: approvals, visibility, paved roads, and fast feedback instead of blanket bans.",
    topic: "developer-tooling",
    keywords: ["ai governance", "developer experience", "platform engineering"],
    score: 81,
    confidence: 0.76,
    sourceCount: 1,
    status: "reviewed",
    createdAt: "2026-05-24T13:25:00.000Z",
    updatedAt: "2026-05-24T13:35:00.000Z",
    posts: [mockPosts[1]],
    suggestedAngle: "A practical platform-engineering checklist for AI tool governance."
  },
  {
    id: "sig-secret-scanning",
    title: "Secret scanning is becoming a baseline for AI-assisted repository hygiene",
    summary:
      "Security conversations suggest smaller teams are adopting lightweight secret scanning because generated scripts and config snippets can accidentally capture sensitive values.",
    topic: "cybersecurity",
    keywords: ["secret scanning", "repo hygiene", "ai scripts"],
    score: 74,
    confidence: 0.71,
    sourceCount: 1,
    status: "new",
    createdAt: "2026-05-24T13:30:00.000Z",
    updatedAt: "2026-05-24T13:30:00.000Z",
    posts: [mockPosts[2]],
    suggestedAngle: "Minimum viable secret scanning for indie and small engineering teams."
  }
] satisfies Signal[];

export const mockDrafts = [
  {
    id: "draft-flaky-tests",
    signalId: "sig-flaky-tests",
    title: "Flaky Test Ownership in the AI Coding Era",
    slug: "flaky-test-ownership-ai-coding-era",
    excerpt:
      "AI-assisted development can increase delivery speed, but it also makes noisy CI more expensive. Here is how teams can tighten flaky test ownership.",
    contentMarkdown:
      "# Flaky Test Ownership in the AI Coding Era\n\nSignals observed from public Reddit discussions show a practical concern: faster code generation can expose weak spots in CI ownership.\n\n## Why This Matters\n\nFlaky tests are no longer only a testing annoyance. They slow reviews, blur release confidence, and create alert fatigue.\n\n## A Practical Response\n\n- Assign ownership for high-noise suites.\n- Track freshness and recurrence, not just failures.\n- Make triage visible in release review.\n- Use automation to summarize patterns, not to hide them.\n\n## Human Review Note\n\nThis draft is original analysis generated from trend metadata and short snippets. It requires editorial review before publishing.",
    seoTitle: "Flaky Test Ownership in the AI Coding Era",
    seoDescription:
      "A practical QA guide to reducing flaky test risk as AI-assisted development increases CI velocity.",
    status: "approved",
    version: 1,
    editorialNotes: null,
    tags: ["qa", "testing", "ai-coding", "ci"],
    faqs: [
      { question: "What makes a test flaky?", answer: "Non-deterministic behavior caused by timing, state leakage, or environment differences." },
      { question: "How should flaky test ownership work?", answer: "Ownership should follow the team that last touched the code the test covers." }
    ],
    createdAt: "2026-05-24T14:00:00.000Z",
    updatedAt: "2026-05-24T14:20:00.000Z",
    publishedAt: null
  },
  {
    id: "draft-ai-governance",
    signalId: "sig-ai-governance",
    title: "AI Tool Governance Belongs in the Developer Platform",
    slug: "ai-tool-governance-developer-platform",
    excerpt:
      "The strongest AI governance patterns look less like bans and more like clear, observable developer workflows.",
    contentMarkdown:
      "# AI Tool Governance Belongs in the Developer Platform\n\nSignals observed from public Reddit discussions suggest that engineering teams want AI governance that improves safety without making useful tools impossible to adopt.\n\n## Platform Patterns\n\n- Provide approved tools and defaults.\n- Log usage decisions where appropriate.\n- Make data-handling rules easy to find.\n- Review risky workflows manually.\n\nThis article is a draft and requires human review before publication.",
    seoTitle: "AI Tool Governance for Developer Platforms",
    seoDescription:
      "How platform teams can design practical AI tool governance without blocking developer productivity.",
    status: "draft",
    version: 1,
    editorialNotes: null,
    tags: ["ai-governance", "platform-engineering", "developer-experience"],
    faqs: null,
    createdAt: "2026-05-24T15:00:00.000Z",
    updatedAt: "2026-05-24T15:00:00.000Z",
    publishedAt: null
  }
] satisfies Draft[];
