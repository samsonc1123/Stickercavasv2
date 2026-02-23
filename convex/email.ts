import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendTestEmail = action({
  args: {},
  handler: async (ctx) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    return await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "jhonnycomelately82@gmail.com",
      subject: "Admin Uploader Test",
      html: "<strong>Email system is live.</strong>",
    });
  },
});

export const sendUploadConfirmation = action({
  args: {
    stickerCode: v.string(),
    stickerName: v.string(),
    categoryCode: v.string(),
    subcategoryCode: v.string(),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    return await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "jhonnycomelately82@gmail.com",
      subject: "Admin Uploader Test",
      html: `
        <h2>Sticker Uploaded Successfully</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:4px 12px;font-weight:bold;">Code:</td><td style="padding:4px 12px;">${args.stickerCode}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Name:</td><td style="padding:4px 12px;">${args.stickerName}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Filename:</td><td style="padding:4px 12px;">${args.filename}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Category:</td><td style="padding:4px 12px;">${args.categoryCode}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Subcategory:</td><td style="padding:4px 12px;">${args.subcategoryCode}</td></tr>
        </table>
      `,
    });
  },
});

export const healthCheck = action({
  args: {},
  handler: async () => {
    const key = process.env.RESEND_API_KEY;
    const hasResendKey = typeof key === "string" && key.trim().length > 0;
    const resendKeyPrefix = hasResendKey ? key!.trim().slice(0, 6) : null;
    const ok = hasResendKey;
    return { ok, hasResendKey, resendKeyPrefix };
  },
});
