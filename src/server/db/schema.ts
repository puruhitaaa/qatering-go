import { pgTableCreator } from "drizzle-orm/pg-core"

export * from "./app-schema"
export * from "./auth-schema"

export const createTable = pgTableCreator((name) => `qatering-go_${name}`)
