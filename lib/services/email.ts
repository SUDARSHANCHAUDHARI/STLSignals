import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "signals@stlsignals.dev";
const NOTIFY = process.env.NOTIFY_EMAIL;

export async function sendDraftApprovedEmail(draftTitle: string, draftSlug: string) {
  if (!process.env.RESEND_API_KEY || !NOTIFY) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stlsignals.dev";

  await resend.emails.send({
    from: FROM,
    to: NOTIFY,
    subject: `Draft approved: ${draftTitle}`,
    html: `
      <h2>Draft Approved</h2>
      <p><strong>${draftTitle}</strong> has been approved and is ready to publish.</p>
      <p><a href="${siteUrl}/blog/${draftSlug}">Preview post</a></p>
      <hr/>
      <p style="color:#888;font-size:12px;">STL Signals · Require human review before publishing</p>
    `
  });
}
