import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "@/db/index";
import type { QuestionWithOptions } from "@/db/types.ts";

const getRandomQuestion = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		const questions = await db
			.selectFrom("questions")
			.selectAll()
			.select((eb) => [
				jsonArrayFrom(
					eb
						.selectFrom("question_option")
            .select([
              "question_option.correct",
              "question_option.reasoning",
              "question_option.text",
              "question_option.option"
						])
						.whereRef("question_option.questionId", "=", "questions.id"),
				).as("questionOption"),
			])
			.execute();

		if (questions.length === 0) {
			return null;
		}

		// Get random question by selecting a random index
		const randomIndex = Math.floor(Math.random() * questions.length);
		return questions[randomIndex] as QuestionWithOptions;
	} catch (error) {
		console.error("Error fetching random question:", error);
		return null;
	}
});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => await getRandomQuestion(),
});

function Home() {
	const randomQuestion = Route.useLoaderData() as any;

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-2xl text-center">
				<h1 className="text-4xl font-bold text-white mb-8">
					Exam Review System
				</h1>

				{randomQuestion && randomQuestion.id ? (
					<div className="bg-slate-800 border-slate-700 rounded-xl p-8">
						<h2 className="text-2xl text-cyan-400 mb-4">
							Random Question Available
						</h2>
						<p className="text-gray-300 mb-6">
							Question ID: {randomQuestion.id}
						</p>
						<a
							href={`/question/${randomQuestion.id}`}
							className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
						>
							Start Question
						</a>
					</div>
				) : (
					<div className="bg-slate-800 border-slate-700 rounded-xl p-8">
						<h2 className="text-2xl text-gray-400 mb-4">
							No Questions Available
						</h2>
						<p className="text-gray-500">
							Please add questions to the database first.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
