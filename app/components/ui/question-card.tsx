import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { QuestionButtons } from "./question-button";

interface QuestionCardProps {
  onQuestionClick: (question: string) => void;
  onButtonsHidden: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  onQuestionClick,
  onButtonsHidden,
}) => {
  return (
    <Card className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-3xl">
      <CardHeader className="text-center text-2xl">
        <CardTitle>Learn about Grey Haven AI</CardTitle>
        <CardDescription>
          Select from the following suggestions or ask your own.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-10 max-h-72 overflow-y-auto">
        <QuestionButtons
          onQuestionClick={onQuestionClick}
          onButtonsHidden={onButtonsHidden}
        />
      </CardContent>
    </Card>
  );
};