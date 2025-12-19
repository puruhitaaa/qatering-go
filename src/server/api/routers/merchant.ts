import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

export const merchantRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return [
      { id: 1, name: "Cattle Farm", logo: "/merchant/cattle.png" },
      { id: 2, name: "FNB", logo: "/merchant/fnb.png" },
      { id: 3, name: "FNB Group", logo: "/merchant/fnb-group.png" },
      { id: 4, name: "Halal Food", logo: "/merchant/halal.png" },
    ]
  }),
})
