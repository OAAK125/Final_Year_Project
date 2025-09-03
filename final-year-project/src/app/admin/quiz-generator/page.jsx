
import { GenerateQuiz } from "@/ui/admin-dashboard/quiz-gen"
import {QuizzesManagement} from "@/ui/admin-dashboard/quizzes-man"

export default function QuizGenerator() {

    return (
        <>
            <QuizzesManagement />
            <GenerateQuiz />
        </>
    )
}