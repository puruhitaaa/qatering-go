import { TRPCError } from "@trpc/server"
import { asc, eq } from "drizzle-orm"
import { z } from "zod"
import {
  createPaginatedResponse,
  paginationSchema,
  searchFilterSchema,
} from "@/server/api/common/utils"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc"
import { db } from "@/server/db"
import { menuItem } from "@/server/db/app-schema"

export const menuItemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        itemName: z.string().min(1),
        description: z.string().optional(),
        unitPrice: z.number().min(0), // Input as number, stored as decimal
        imageUrl: z.string().optional(),
        isAvailable: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the vendor associated with this user
      const userVendor = await ctx.db.query.vendor.findFirst({
        where: (v, { eq }) => eq(v.userId, ctx.session.user.id),
      })

      if (!userVendor) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must have a vendor profile to create menu items",
        })
      }

      await ctx.db.insert(menuItem).values({
        vendorId: userVendor.id,
        itemName: input.itemName,
        description: input.description,
        unitPrice: input.unitPrice.toString(), // Convert to string for decimal
        imageUrl: input.imageUrl,
        isAvailable: input.isAvailable,
      })

      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        itemName: z.string().min(1).optional(),
        description: z.string().optional(),
        unitPrice: z.number().min(0).optional(),
        imageUrl: z.string().optional(),
        isAvailable: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.menuItem.findFirst({
        where: (m, { eq }) => eq(m.id, input.id),
        with: {
          vendor: true,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu item not found",
        })
      }

      // Check ownership via vendor -> user relationship
      // Note: we need to join or fetch vendor. Actually `existing.vendor` relation should help if eager loaded,
      // but Drizzle query relations might need explicit fetching if not set up to pull automatically or if we check manually.
      // Based on my query above `with: { vendor: true }`, `existing.vendor` should be present.

      // existing.vendor is a relation.
      // Wait, TS might complain if I don't type strict or if relation is optional.
      // `vendor` table has `userId`.

      if (existing.vendor.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" })
      }

      await ctx.db
        .update(menuItem)
        .set({
          itemName: input.itemName,
          description: input.description,
          unitPrice: input.unitPrice ? input.unitPrice.toString() : undefined,
          imageUrl: input.imageUrl,
          isAvailable: input.isAvailable,
        })
        .where(eq(menuItem.id, input.id))

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.menuItem.findFirst({
        where: (m, { eq }) => eq(m.id, input.id),
        with: { vendor: true },
      })

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (existing.vendor.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      await ctx.db.delete(menuItem).where(eq(menuItem.id, input.id))
      return { success: true }
    }),

  getAll: publicProcedure
    .input(
      paginationSchema.merge(searchFilterSchema).extend({
        vendorId: z.number().optional(),
        isAvailable: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor, search, vendorId, isAvailable } = input

      const items = await db.query.menuItem.findMany({
        limit: limit + 1,
        where: (m, { and, gt, eq, ilike }) => {
          const conditions = []
          if (cursor) conditions.push(gt(m.id, cursor))
          if (search) conditions.push(ilike(m.itemName, `%${search}%`))
          if (vendorId !== undefined) conditions.push(eq(m.vendorId, vendorId))
          if (isAvailable !== undefined)
            conditions.push(eq(m.isAvailable, isAvailable))
          return and(...conditions)
        },
        orderBy: asc(menuItem.id),
      })

      return createPaginatedResponse(items, limit)
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.menuItem.findFirst({
        where: (m, { eq }) => eq(m.id, input.id),
        with: { vendor: true },
      })

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return item
    }),
})
