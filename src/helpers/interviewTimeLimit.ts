import prisma from "@/lib/db/db";
import { generateReportForInterview } from "@/helpers/reportGeneration";

export async function autoEndIfExpired<
  T extends {
    id: string;
    status: string;
    startedAt: Date | null;
    timeLimitMinutes: number;
  },
>(interview: T): Promise<T> {
  if (interview.status !== "IN_PROGRESS" || !interview.startedAt) {
    return interview;
  }

  const deadline = new Date(
    interview.startedAt.getTime() + interview.timeLimitMinutes * 60_000,
  );

  if (new Date() < deadline) {
    return interview;
  }

  const { count } = await prisma.interview.updateMany({
    where: { id: interview.id, status: "IN_PROGRESS" },
    data: { status: "COMPLETED", endedAt: deadline },
  });

  if (count > 0) {
    generateReportForInterview(interview.id).catch((err) => {
      console.error("REPORT_GENERATION_FAILED", interview.id, err);
    });
  }

  return { ...interview, status: "COMPLETED", endedAt: deadline };
}
