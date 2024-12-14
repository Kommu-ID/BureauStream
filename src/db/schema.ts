import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, json } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const adminsTable = pgTable("admins", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
})

export const servicesTable = pgTable("services", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  workflow: json(),
});

export const conversationsTable = pgTable("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  service_id: uuid(),
  service_state: json(),
  user_id: uuid().notNull(),
  messages: json(),
})

export const usersRelations = relations(usersTable, ({ many }) => ({
  conversations: many(conversationsTable)
}))

export const conversationsRelations = relations(conversationsTable, ({ one }) => ({
  service: one(servicesTable, {
    fields: [conversationsTable.service_id],
    references: [servicesTable.id]
  })
}))
