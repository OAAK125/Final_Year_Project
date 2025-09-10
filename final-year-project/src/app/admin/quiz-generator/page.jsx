
import { GenerateQuestions } from "@/ui/admin-dashboard/questions-gen"
import {QuizzesManagement} from "@/ui/admin-dashboard/quizzes-man"

export default function QuizGenerator() {

    return (
        <>
            <QuizzesManagement />
            <GenerateQuestions />
        </>
    )
}