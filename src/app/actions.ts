"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { clearCurrentUser, setCurrentUser } from "@/lib/session";

export async function setLocaleAction(locale: Locale) {
  const store = await cookies();
  store.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

export async function loginAsAction(userId: string) {
  await setCurrentUser(userId);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearCurrentUser();
  revalidatePath("/", "layout");
  redirect("/");
}
