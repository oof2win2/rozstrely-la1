import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { LibsqlDialect } from "kysely-libsql";
import type { Database } from "./types.ts";

export const db = new Kysely<Database>({
	dialect: new LibsqlDialect({
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN!,
	}),
	plugins: [new ParseJSONResultsPlugin()]
});

export type { Database } from "./types.ts";
