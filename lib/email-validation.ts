import dns from "dns/promises";
import disposableDomains from "disposable-email-domains";

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const normalized = email.toLowerCase().trim();

  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, error: "Invalid email format." };
  }

  const domain = normalized.split("@")[1];

  if (disposableDomains.includes(domain)) {
    return { valid: false, error: "Disposable email addresses are not allowed." };
  }

  try {
    const records = await dns.resolveMx(domain);
    if (records.length === 0) {
      return { valid: false, error: "Email domain does not accept mail." };
    }
  } catch {
    return { valid: false, error: "Email domain does not exist." };
  }

  return { valid: true };
}
