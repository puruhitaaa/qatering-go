import { TRPCError } from "@trpc/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import {
  createPaginatedResponse,
  paginationSchema,
} from "@/server/api/common/utils"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { order, orderItem, payment } from "@/server/db/app-schema"

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        vendorId: z.number(),
        deliveryAddressId: z.number(),
        paymentMethodId: z.number(),
        items: z
          .array(
            z.object({
              menuItemId: z.number(),
              quantity: z.number().min(1),
              specialRequests: z.string().optional(),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Verify Address
      const address = await ctx.db.query.customerAddress.findFirst({
        where: (a, { eq, and }) =>
          and(
            eq(a.id, input.deliveryAddressId),
            eq(a.userId, ctx.session.user.id)
          ),
      })
      if (!address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid delivery address",
        })
      }

      // 2. Fetch Items
      const itemIds = input.items.map((i) => i.menuItemId)
      const dbItems = await ctx.db.query.menuItem.findMany({
        where: (m, { inArray }) => inArray(m.id, itemIds),
      })

      if (dbItems.length !== itemIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some items not found",
        })
      }

      let totalAmount = 0
      const orderItemsData: {
        menuItemId: number
        quantity: number
        unitPriceSnapshot: string
        specialRequests?: string
      }[] = []

      for (const item of input.items) {
        const dbItem = dbItems.find((d) => d.id === item.menuItemId)
        if (!dbItem || !dbItem.isAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Item ${dbItem?.itemName} is unavailable`,
          })
        }
        if (dbItem.vendorId !== input.vendorId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Items must be from the same vendor",
          })
        }
        const price = parseFloat(dbItem.unitPrice)
        totalAmount += price * item.quantity

        orderItemsData.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPriceSnapshot: dbItem.unitPrice,
          specialRequests: item.specialRequests,
        })
      }

      // 3. Transaction
      return await ctx.db.transaction(async (tx) => {
        const [newOrder] = await tx
          .insert(order)
          .values({
            customerId: ctx.session.user.id,
            vendorId: input.vendorId,
            deliveryAddressId: input.deliveryAddressId,
            totalAmount: totalAmount.toFixed(2),
            orderStatus: "pending",
          })
          .returning({ id: order.id })

        if (!newOrder) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          })
        }

        for (const itemData of orderItemsData) {
          await tx.insert(orderItem).values({
            orderId: newOrder.id,
            ...itemData,
          })
        }

        await tx.insert(payment).values({
          orderId: newOrder.id,
          paymentMethodId: input.paymentMethodId,
          amount: totalAmount.toFixed(2),
          paymentStatus: "pending",
        })

        return { success: true, orderId: newOrder.id }
      })
    }),

  list: protectedProcedure
    .input(
      paginationSchema.extend({
        role: z.enum(["customer", "vendor"]).default("customer"),
        status: z
          .enum([
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "completed",
            "cancelled",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50
      const { cursor, role, status } = input

      let targetVendorId: number | undefined

      if (role === "vendor") {
        const userVendor = await ctx.db.query.vendor.findFirst({
          where: (v, { eq }) => eq(v.userId, ctx.session.user.id),
        })
        if (!userVendor) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No vendor profile found",
          })
        }
        targetVendorId = userVendor.id
      }

      const items = await ctx.db.query.order.findMany({
        limit: limit + 1,
        where: (o, { and, eq, lt }) => {
          const conditions = []

          // If customer, filter by their ID
          if (role === "customer") {
            conditions.push(eq(o.customerId, ctx.session.user.id))
          }
          // If vendor, filter by their vendorID (fetched above)
          else if (targetVendorId) {
            conditions.push(eq(o.vendorId, targetVendorId))
          }

          if (status) {
            conditions.push(eq(o.orderStatus, status))
          }

          if (cursor) {
            conditions.push(lt(o.id, cursor)) // DESC sort: older items have smaller IDs
          }

          return and(...conditions)
        },
        orderBy: desc(order.id),
        with: {
          orderItems: {
            with: {
              menuItem: true,
            },
          },
          payment: true,
          // Conditionally include relations based on role if needed, or always include
        },
      })

      return createPaginatedResponse(items, limit)
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "preparing",
          "out_for_delivery",
          "completed",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingOrder = await ctx.db.query.order.findFirst({
        where: (o, { eq }) => eq(o.id, input.orderId),
      })

      if (!existingOrder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
      }

      // Check authorization: Only vendor of the order can update status
      const userVendor = await ctx.db.query.vendor.findFirst({
        where: (v, { eq }) => eq(v.userId, ctx.session.user.id),
      })

      if (!userVendor || userVendor.id !== existingOrder.vendorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this order",
        })
      }

      await ctx.db
        .update(order)
        .set({ orderStatus: input.status })
        .where(eq(order.id, input.orderId))

      return { success: true }
    }),
})
