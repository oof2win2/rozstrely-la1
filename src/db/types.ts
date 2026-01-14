interface QuestionOptionTable {
	questionId: string;
	option: "a" | "b" | "c" | "d";
	text: string;
	correct: number;
	reasoning: string;
}

interface QuestionTable {
	id: string;
	text: string
}

interface QuestionOptionWithQuestionId extends QuestionOptionTable {
	questionId: string;
}

interface QuestionWithOptions {
	id: string;
	questionOption: QuestionOptionTable[];
}

interface Database {
	questions: QuestionTable;
	question_option: QuestionOptionWithQuestionId;
}

export type {
	Database,
	QuestionWithOptions,
	QuestionOptionTable,
	QuestionTable,
};
