import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { db } from "@/server/db"
import { vendor } from "@/server/db/app-schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
      },
      phoneNumber: {
        type: "number",
        required: true,
        unique: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 128,
    minPasswordLength: 8,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Auto-create vendor record when user registers with 'vendor' role
          if (user.role === "vendor") {
            await db.insert(vendor).values({
              userId: user.id,
              businessName: user.name || "New Vendor",
              status: "pending_approval",
            })
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
