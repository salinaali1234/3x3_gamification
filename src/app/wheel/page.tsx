import { redirect } from "next/navigation";

/** Wheel feature removed — send old links to Street Pass rewards. */
export default function WheelPage() {
  redirect("/rewards");
}
