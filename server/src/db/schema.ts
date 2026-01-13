import { boolean, integer, pgTable, real, varchar } from "drizzle-orm/pg-core";

// export const usersTable = pgTable("users", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull(),
//   age: integer().notNull(),
//   email: varchar({ length: 255 }).notNull().unique(),
// });

export const transactionsTable = pgTable("transactions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: real().notNull(),
    date: varchar({ length: 10 }).notNull(),
    categoryId: varchar({ length: 100 }).notNull(),
    paymentMethod: varchar({ length: 20 }).notNull(), // 'cash' | 'upi' | 'card' | 'netbanking'
    notes: varchar({ length: 255 }),
    isRecurring: boolean().notNull().default(false),
});
