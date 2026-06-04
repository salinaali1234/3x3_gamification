import { redirect } from "next/navigation";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code?.trim();
  redirect(code ? `/challenges?code=${encodeURIComponent(code)}` : "/challenges");
}
