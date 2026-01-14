import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db/index";

export const Route = createFileRoute("/api/questions")({
	server: {
		handlers: {
			GET: async () => {
				const questions = await db.query.question.findMany({
					with: {
						questionOption: true,
					},
				});

				return Response.json(questions);
			},
		},
	},
});
