
import { db, schema } from "@/db";
import questions from "./questions_one.json"
import {nanoid} from "nanoid"

// await db.delete(schema.question)

const queries = []
for (const question of questions) {
  const qid = nanoid()
  queries.push(
    db.insert(schema.question).values({
      id: qid
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
