import { action } from "./_generated/server";
import { v } from "convex/values";

export const signIn = action({
  args: {
    params: v.object({
      email: v.string(),
    }),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    // Temporary placeholder logic
    return { success: true, email: args.params.email, provider: args.provider };
  },
});