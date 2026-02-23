import { query, mutation } from "./_generated/server";

export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const users = await ctx.db.query("users").collect();
    const user = users.find(
      (u) => u.email === identity.email
    );

    return (user as any)?.role ?? null;
  },
});

export const bootstrapAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const users = await ctx.db.query("users").collect();
    const user = users.find(
      (u) => u.email === identity.email
    );

    if (!user) {
      return { status: "user_not_found", email: identity.email };
    }

    if ((user as any).role === "admin") {
      return { status: "already_admin", email: identity.email };
    }

    await ctx.db.patch(user._id, { role: "admin" } as any);
    return { status: "upgraded", email: identity.email };
  },
});
