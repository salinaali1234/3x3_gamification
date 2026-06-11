import { redirect } from "next/navigation";

/** Legacy route — challenges and journey are one page now. */
export default async function JourneyPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const query = params.code
    ? `?code=${encodeURIComponent(params.code)}`
    : "";
  redirect(`/challenges${query}`);
}
