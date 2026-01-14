import { sql } from "drizzle-orm";
import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
	id: integer({ mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	title: text().notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const question = sqliteTable("questions", {
	id: integer().primaryKey({ autoIncrement: true }),
});

export const questionOption = sqliteTable(
	"question_option",
	{
		questionId: integer().references(() => question.id, {
			onDelete: "cascade",
		}),
		option: text({ enum: ["a", "b", "c", "d"] }).notNull(),
		text: text().notNull(),
		correct: integer({ mode: "boolean" }).notNull(),
		reasoning: text().notNull(),
	},
	(tbl) => [primaryKey({ columns: [tbl.questionId, tbl.option] })],
);
