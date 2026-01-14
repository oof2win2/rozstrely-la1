
// import { db, schema } from "@/db";
import * as schema from "@/db/schema"
import {drizzle} from "drizzle-orm/libsql"
import questions from "./questions_four.json"
import {nanoid} from "nanoid"
const db = drizzle({
  schema,
  connection: {
    url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN!,
  }
})

// await db.delete(schema.question)

const queries = []
for (const question of questions) {
  const qid = nanoid()
  queries.push(
    db.insert(schema.question).values({
      id: qid,
      text: question.question
    })
  )
  for (const letter of ["a", "b", "c", "d"] as const) {
    queries.push(db.insert(schema.questionOption).values({
      questionId: qid,
      option: letter,
      text: question[letter],
      correct: question.answers.includes(letter),
      reasoning: question[`${letter}_explanation`]
    }))
  }
}

await db.batch(queries)

console.log(`Imported ${questions.length} questions`)
