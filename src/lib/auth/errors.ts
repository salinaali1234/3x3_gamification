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
  if (
    m.includes("rate limit") ||
    m.includes("over_email_send_rate_limit") ||
    m.includes("too many requests")
  ) {
    return "rate_limit";
  }
  if (m.includes("redirect") && m.includes("not allowed")) {
    return "redirect_not_allowed";
  }
  return "auth_failed";
}
