import { QuizHomeScreen } from "@/screens/quiz-home-screen";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const params = await searchParams;
  const query = Number(params.day);
  const previewEnded = Number.isInteger(query) && (query < 1 || query > 10);
  return <QuizHomeScreen previewEnded={previewEnded} />;
}
