import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "@/db/index";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { sql } from "kysely";

const getQuestion = createServerFn({
	method: "GET",
})
	.inputValidator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		try {
			const questionData = await db
				.selectFrom("questions")
				.selectAll()
				.where("id", "=", data.id)
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom("question_option")
							.select([
								"question_option.questionId",
								"question_option.option",
								"question_option.text",
								"question_option.correct",
								"question_option.reasoning",
							])
							.whereRef("question_option.questionId", "=", "questions.id"),
					).as("questionOption"),
				])
				.executeTakeFirst();

			return questionData || null;
		} catch (error) {
			console.error("Error fetching question:", error);
			return null;
		}
	});

const getRandomQuestionId = createServerFn({
	method: "GET",
}).handler(async () => {
	const questionId = await db
		.selectFrom("questions")
		.select("id")
		.orderBy(sql`random()`)
		.executeTakeFirst();

	if (questionId?.id)
		throw redirect({ to: "/question/$id", params: { id: questionId?.id } });
	throw redirect({ to: "/" });
});
export const Route = createFileRoute("/question/$id")({
	component: QuestionView,
	loader: async ({ params }) => await getQuestion({ data: { id: params.id } }),
});

function QuestionView() {
	const questionData = Route.useLoaderData();
	const goToNext = useServerFn(getRandomQuestionId);
	const [showResults, setShowResults] = useState(false);
	const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
		new Set(),
	);

	if (!questionData || !questionData.questionOption) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
				<div className="w-full max-w-2xl text-center">
					<h1 className="text-4xl font-bold text-white mb-8">
						Question Not Found
					</h1>
					<p className="text-gray-300 mb-6">
						The question you're looking for doesn't exist.
					</p>
					<a
						href="/"
						className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
					>
						Back to Home
					</a>
				</div>
			</div>
		);
	}

	const handleOptionToggle = (option: string) => {
		const newSelected = new Set(selectedOptions);
		if (newSelected.has(option)) {
			newSelected.delete(option);
		} else {
			newSelected.add(option);
		}
		setSelectedOptions(newSelected);
	};

	const handleSubmit = () => {
		setShowResults(true);
	};

	const isCorrect = (option: string) => {
		const optionData = questionData.questionOption.find(
			(o: any) => o.option === option,
		);
		return optionData?.correct;
	};

	const isOptionSelected = (option: string) => selectedOptions.has(option);

	const isSelectedCorrect = (option: string) => {
		return isCorrect(option) && isOptionSelected(option);
	};

	const isSelectedIncorrect = (option: string) => {
		return !isCorrect(option) && isOptionSelected(option);
	};

	const isMissedCorrect = (option: string) => {
		return isCorrect(option) && !isOptionSelected(option);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-3xl bg-slate-800 border-slate-700 rounded-xl p-8 text-white">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">
						Question {questionData.id}
					</h1>
					{questionData.text}
					<p className="text-gray-300 text-lg">Select all correct answers:</p>
				</div>

				<div className="space-y-4 mb-8">
					{questionData.questionOption.map((opt: any) => (
						<button
							type="button"
							key={opt.option}
							onClick={() => handleOptionToggle(opt.option)}
							disabled={showResults}
							className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
								showResults
									? isSelectedCorrect(opt.option)
										? "border-green-500 bg-green-500/10"
										: isSelectedIncorrect(opt.option)
											? "border-red-500 bg-red-500/10"
											: isMissedCorrect(opt.option)
												? "border-yellow-500 bg-yellow-500/10"
												: "border-slate-600 bg-slate-700/50"
									: "border-slate-600 bg-slate-700/50 hover:border-slate-500"
							}`}
						>
							<div className="flex items-start gap-3">
								<input
									type="checkbox"
									id={`option-${opt.option}`}
									checked={selectedOptions.has(opt.option)}
									onChange={(e) => {
										e.stopPropagation();
										handleOptionToggle(opt.option);
									}}
									disabled={showResults}
									onClick={(e) => e.stopPropagation()}
									className="mt-1 w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
								/>
								<div className="flex-1">
									<label
										htmlFor={`option-${opt.option}`}
										className="text-white cursor-pointer font-medium"
									>
										{opt.option.toUpperCase()}. {opt.text}
									</label>
									{showResults && (
										<div className="mt-3 space-y-2">
											<div className="flex items-center gap-2">
												{opt.correct ? (
													<CheckCircle2 className="w-5 h-5 text-green-500" />
												) : (
													<XCircle className="w-5 h-5 text-red-500" />
												)}
												<span className="text-gray-300">
													{opt.correct ? "Pravda" : "Nepravda"}
												</span>
											</div>
											<p className="text-sm text-gray-400 italic">
												{opt.reasoning}
											</p>
										</div>
									)}
								</div>
							</div>
						</button>
					))}
				</div>

				<div className="flex items-center justify-between gap-4">
					{!showResults ? (
						<>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={selectedOptions.size === 0}
								className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
							>
								Check Answers
							</button>
							<button
								type="button"
								onClick={async () => {
									setShowResults(false);
									setSelectedOptions(new Set());
									await goToNext();
								}}
								className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
							>
								Skip Question
							</button>
						</>
					) : (
						<>
							<a
								href="/"
								className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
							>
								Back to Home
							</a>
							<button
								type="button"
								onClick={() => {
									setShowResults(false);
									setSelectedOptions(new Set());
								}}
								className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
							>
								Try Again
							</button>
							<button
								type="button"
								onClick={async () => {
									setShowResults(false);
									setSelectedOptions(new Set());
									await goToNext();
								}}
								className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
							>
								Next Question
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
