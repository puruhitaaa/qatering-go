import { z } from "zod"

/**
 * Common pagination schema for list queries.
 * Uses cursor-based pagination for better performance on large datasets.
 */
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  cursor: z.number().nullish(), // Assuming ID-based cursor for simplicity, or timestamp
})

export type PaginationInput = z.infer<typeof paginationSchema>

/**
 * Generic filter schema helper.
 * Can be extended by specific router schemas.
 */
export const searchFilterSchema = z.object({
  search: z.string().optional(),
})

/**
 * Helper to construct a paginated response.
 * @param items The list of items retrieved from the DB (limit + 1).
 * @param limit The requested limit.
 * @returns Object containing the items (sliced to limit) and the next cursor.
 */
export function createPaginatedResponse<T extends { id: number }>(
  items: T[],
  limit: number
) {
  let nextCursor: PaginationInput["cursor"] | undefined

  // If we fetched more than the limit, it means there are more items
  if (items.length > limit) {
    const nextItem = items.pop() // Remove the extra item
    nextCursor = nextItem?.id // Use the ID of the popped item (or the last item of the kept list? Usually last item of kept list if we query > limit)
    // Correction: Standard pattern is fetch limit + 1. If length > limit, pop last and set nextCursor to the id of the LAST ITEM RETAINED.
    // Or simpler: nextCursor is the ID of the last item in the returned slice.

    // Let's stick to: fetch limit + 1.
    // If items.length > limit:
    //   nextCursor = items[limit - 1].id (the last item that will be returned) -- WAIT, no.
    //   nextCursor should be the cursor to fetch the NEXT page.
    //   So if we have [1, 2, 3, 4, 5] and limit is 4.
    //   We return [1, 2, 3, 4].
    //   nextCursor should be 4 (if query is > cursor).

    // Actually simpler:
    // If we have items.length > limit:
    //   nextCursor = items[items.length - 1].id (of the retained items).
    //   We pop the extra one.
    //   items.pop();
    //   nextCursor = items[items.length - 1].id;

    const lastItem = items[limit - 1]
    nextCursor = lastItem?.id
  }

  return {
    items,
    nextCursor,
  }
}
