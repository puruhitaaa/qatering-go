import { relations } from "drizzle-orm"
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { account, session, user } from "./auth-schema"

// ============================================================================
// VENDOR DOMAIN
// ============================================================================

export const vendor = pgTable(
  "qatering-go_vendor",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    businessDescription: text("business_description"),
    supportPhone: text("support_phone"),
    status: text("status", {
      enum: ["pending_approval", "active", "suspended"],
    })
      .default("pending_approval")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("vendor_userId_idx").on(table.userId),
    index("vendor_status_idx").on(table.status),
  ]
)

export const vendorLocation = pgTable(
  "qatering-go_vendor_location",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => vendor.id, { onDelete: "cascade" }),
    addressLine1: text("address_line1").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    gpsLatitude: text("gps_latitude"),
    gpsLongitude: text("gps_longitude"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("vendorLocation_vendorId_idx").on(table.vendorId)]
)

// ============================================================================
// CUSTOMER DOMAIN
// ============================================================================

export const customerAddress = pgTable(
  "qatering-go_customer_address",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipientName: text("recipient_name").notNull(),
    addressLine1: text("address_line1").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    deliveryInstructions: text("delivery_instructions"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("customerAddress_userId_idx").on(table.userId)]
)

// ============================================================================
// MENU DOMAIN
// ============================================================================

export const menuItem = pgTable(
  "qatering-go_menu_item",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => vendor.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(),
    description: text("description"),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("menuItem_vendorId_idx").on(table.vendorId),
    index("menuItem_isAvailable_idx").on(table.isAvailable),
  ]
)

// ============================================================================
// ORDER DOMAIN
// ============================================================================

export const order = pgTable(
  "qatering-go_order",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => vendor.id, { onDelete: "cascade" }),
    deliveryAddressId: integer("delivery_address_id")
      .notNull()
      .references(() => customerAddress.id),
    orderStatus: text("order_status", {
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "completed",
        "cancelled",
      ],
    })
      .default("pending")
      .notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    placedAt: timestamp("placed_at").defaultNow().notNull(),
    requiredDeliveryTime: timestamp("required_delivery_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("order_customerId_idx").on(table.customerId),
    index("order_vendorId_idx").on(table.vendorId),
    index("order_status_idx").on(table.orderStatus),
  ]
)

export const orderItem = pgTable(
  "qatering-go_order_item",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    orderId: integer("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id")
      .notNull()
      .references(() => menuItem.id),
    quantity: integer("quantity").notNull(),
    unitPriceSnapshot: decimal("unit_price_snapshot", {
      precision: 12,
      scale: 2,
    }).notNull(),
    specialRequests: text("special_requests"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("orderItem_orderId_idx").on(table.orderId),
    index("orderItem_menuItemId_idx").on(table.menuItemId),
  ]
)

// ============================================================================
// PAYMENT DOMAIN
// ============================================================================

export const paymentMethod = pgTable("qatering-go_payment_method", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  code: text("code").notNull().unique(), // e.g., 'COD', 'MIDTRANS_GW'
  name: text("name").notNull(), // e.g., 'Cash on Delivery', 'Midtrans Gateway'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const payment = pgTable(
  "qatering-go_payment",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    orderId: integer("order_id")
      .notNull()
      .unique()
      .references(() => order.id, { onDelete: "cascade" }),
    paymentMethodId: integer("payment_method_id")
      .notNull()
      .references(() => paymentMethod.id),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    paymentStatus: text("payment_status", {
      enum: ["pending", "paid", "failed", "refunded"],
    })
      .default("pending")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("payment_orderId_idx").on(table.orderId),
    index("payment_status_idx").on(table.paymentStatus),
  ]
)

// COD-specific payment details (1:1 with payment)
export const paymentCodDetails = pgTable("qatering-go_payment_cod_details", {
  paymentId: integer("payment_id")
    .primaryKey()
    .references(() => payment.id, { onDelete: "cascade" }),
  collectedBy: text("collected_by"),
  collectedAt: timestamp("collected_at"),
})

// Midtrans-specific payment details (1:1 with payment)
export const paymentMidtransDetails = pgTable(
  "qatering-go_payment_midtrans_details",
  {
    paymentId: integer("payment_id")
      .primaryKey()
      .references(() => payment.id, { onDelete: "cascade" }),
    midtransTransactionId: text("midtrans_transaction_id"),
    midtransOrderId: text("midtrans_order_id"),
    gatewayStatus: text("gateway_status", {
      enum: ["settlement", "pending", "deny", "expire", "cancel"],
    }),
    paymentTypeUsed: text("payment_type_used"), // e.g., 'credit_card', 'gopay', 'bank_transfer'
    transactionTime: timestamp("transaction_time"),
  }
)

// ============================================================================
// RELATIONS
// ============================================================================

// User relations (defined here to avoid circular imports with auth-schema)
export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  vendor: one(vendor),
  customerAddresses: many(customerAddress),
  orders: many(order),
}))

// Vendor relations
export const vendorRelations = relations(vendor, ({ one, many }) => ({
  user: one(user, {
    fields: [vendor.userId],
    references: [user.id],
  }),
  location: one(vendorLocation),
  menuItems: many(menuItem),
  orders: many(order),
}))

export const vendorLocationRelations = relations(vendorLocation, ({ one }) => ({
  vendor: one(vendor, {
    fields: [vendorLocation.vendorId],
    references: [vendor.id],
  }),
}))

// Customer address relations
export const customerAddressRelations = relations(
  customerAddress,
  ({ one, many }) => ({
    user: one(user, {
      fields: [customerAddress.userId],
      references: [user.id],
    }),
    orders: many(order),
  })
)

// Menu item relations
export const menuItemRelations = relations(menuItem, ({ one, many }) => ({
  vendor: one(vendor, {
    fields: [menuItem.vendorId],
    references: [vendor.id],
  }),
  orderItems: many(orderItem),
}))

// Order relations
export const orderRelations = relations(order, ({ one, many }) => ({
  customer: one(user, {
    fields: [order.customerId],
    references: [user.id],
  }),
  vendor: one(vendor, {
    fields: [order.vendorId],
    references: [vendor.id],
  }),
  deliveryAddress: one(customerAddress, {
    fields: [order.deliveryAddressId],
    references: [customerAddress.id],
  }),
  orderItems: many(orderItem),
  payment: one(payment),
}))

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  menuItem: one(menuItem, {
    fields: [orderItem.menuItemId],
    references: [menuItem.id],
  }),
}))

// Payment relations
export const paymentMethodRelations = relations(paymentMethod, ({ many }) => ({
  payments: many(payment),
}))

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
  paymentMethod: one(paymentMethod, {
    fields: [payment.paymentMethodId],
    references: [paymentMethod.id],
  }),
  codDetails: one(paymentCodDetails),
  midtransDetails: one(paymentMidtransDetails),
}))

export const paymentCodDetailsRelations = relations(
  paymentCodDetails,
  ({ one }) => ({
    payment: one(payment, {
      fields: [paymentCodDetails.paymentId],
      references: [payment.id],
    }),
  })
)

export const paymentMidtransDetailsRelations = relations(
  paymentMidtransDetails,
  ({ one }) => ({
    payment: one(payment, {
      fields: [paymentMidtransDetails.paymentId],
      references: [payment.id],
    }),
  })
)
