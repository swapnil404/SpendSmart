import { boolean, integer, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const transactionsTable = pgTable("transactions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: real().notNull(),
    date: varchar({ length: 10 }).notNull(),
    categoryId: varchar({ length: 100 }).notNull(),
    paymentMethod: varchar({ length: 20 }).notNull(), 
    notes: varchar({ length: 255 }),
    isRecurring: boolean().notNull().default(false),
    userId: text("userId").references(() => user.id),
});

export const categoriesTable = pgTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("userId").references(() => user.id).notNull(),
    color: text("color"),
    icon: text("icon"),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const budgetsTable = pgTable("budgets", {
    id: text("id").primaryKey(),
    userId: text("userId").references(() => user.id).notNull(),
    totalMonthly: real("totalMonthly").notNull(),
    categoryBudgets: text("categoryBudgets").notNull(), // Stored as JSON string
    updatedAt: timestamp("updatedAt").defaultNow(),
});
