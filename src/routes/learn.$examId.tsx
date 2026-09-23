import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { examById } from "@/data/catalog";

export const Route = createFileRoute("/learn/$examId")({
  loader: ({ params }) => {
    const exam = examById(params.examId);
    if (!exam) throw notFound();
    return null;
  },
  component: () => <Outlet />,
});
