/** Maps Supabase Auth errors to stable i18n keys */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "invalid_credentials";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "email_exists";
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("short") || m.includes("least"))) {
    return "password_weak";
  }
  if (m.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  return "auth_failed";
}
