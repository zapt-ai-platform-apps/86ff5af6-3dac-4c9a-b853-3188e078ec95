import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});