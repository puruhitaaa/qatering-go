import { menuItemRouter } from "@/server/api/routers/menuItem"
import { orderRouter } from "@/server/api/routers/order"
import { postRouter } from "@/server/api/routers/post"
import { vendorRouter } from "@/server/api/routers/vendor"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  vendor: vendorRouter,
  menuItem: menuItemRouter,
  order: orderRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
