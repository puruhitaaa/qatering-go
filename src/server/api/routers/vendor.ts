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
import { vendor } from "@/server/db/app-schema"

export const vendorRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(1),
        businessDescription: z.string().optional(),
        supportPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a vendor profile
      const existing = await ctx.db.query.vendor.findFirst({
        where: (v, { eq }) => eq(v.userId, ctx.session.user.id),
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already has a vendor profile",
        })
      }

      await ctx.db.insert(vendor).values({
        userId: ctx.session.user.id,
        businessName: input.businessName,
        businessDescription: input.businessDescription,
        supportPhone: input.supportPhone,
        status: "pending_approval", // Default status
      })

      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        businessName: z.string().min(1).optional(),
        businessDescription: z.string().optional(),
        supportPhone: z.string().optional(),
        status: z.enum(["active", "suspended", "pending_approval"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Ensure user owns this vendor profile or is admin (assuming admin role exists, but for now just owner)
      const existing = await ctx.db.query.vendor.findFirst({
        where: (v, { eq }) => eq(v.id, input.id),
      })

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" })
      }

      await ctx.db
        .update(vendor)
        .set({
          businessName: input.businessName,
          businessDescription: input.businessDescription,
          supportPhone: input.supportPhone,
          status: input.status, // Note: usually status updates require higher privs, but allowing for now.
        })
        .where(eq(vendor.id, input.id))

      return { success: true }
    }),

  getAll: publicProcedure
    .input(paginationSchema.merge(searchFilterSchema))
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor, search } = input

      const items = await db.query.vendor.findMany({
        with: {
          user: true,
          location: true,
          menuItems: {
            columns: {
              id: true, // Only fetch ID to count
            },
          },
        },
        limit: limit + 1,
        where: (v, { and, gt, ilike }) => {
          const conditions = []
          if (cursor) conditions.push(gt(v.id, cursor))
          if (search) conditions.push(ilike(v.businessName, `%${search}%`))
          return and(...conditions)
        },
        orderBy: asc(vendor.id), // ID-based cursor requires ordering by ID
      })

      return createPaginatedResponse(items, limit)
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.query.vendor.findFirst({
        where: (v, { eq }) => eq(v.id, input.id),
        with: {
          location: true,
          // user: true, // Maybe not expose user details publicly unless needed
        },
      })

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return profile
    }),
})
