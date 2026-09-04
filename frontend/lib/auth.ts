export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  businessName?: string;
  businessType?: string;
  providerId?: string;
}

export const PASSWORD_RULES = {
  minLength: (p: string) => p.length >= 8,
  hasLowercase: (p: string) => /[a-z]/.test(p),
  hasUppercase: (p: string) => /[A-Z]/.test(p),
  hasNumber: (p: string) => /[0-9]/.test(p),
  hasSymbol: (p: string) => /[^A-Za-z0-9]/.test(p),
};

export function validatePassword(password: string): {
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
} {
  const checks = {
    minLength: PASSWORD_RULES.minLength(password),
    hasLowercase: PASSWORD_RULES.hasLowercase(password),
    hasUppercase: PASSWORD_RULES.hasUppercase(password),
    hasNumber: PASSWORD_RULES.hasNumber(password),
    hasSymbol: PASSWORD_RULES.hasSymbol(password),
  };

  const isValid = Object.values(checks).every(Boolean);
  return { isValid, checks };
}

export function validateSriLankanPhone(phone: string): boolean {
  // Accepts formats: 0771234567, 077 123 4567, +94771234567, +94 77 123 4567, 0112345678, etc.
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const localPattern = /^0[1-9][0-9]{8}$/; // e.g. 0771234567 (10 digits)
  const intlPattern = /^\+94[1-9][0-9]{8}$/; // e.g. +94771234567 (12 chars)
  return localPattern.test(cleaned) || intlPattern.test(cleaned);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('riceshare_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('riceshare_user', JSON.stringify(user));
    localStorage.setItem('riceshare_role', user.role);
    // Dispatch custom event for real-time reactivity in navbar
    window.dispatchEvent(new Event('riceshare_auth_change'));
  } catch (err) {
    console.warn('Could not save user to localStorage:', err);
  }
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('riceshare_user');
    localStorage.removeItem('riceshare_role');
    window.dispatchEvent(new Event('riceshare_auth_change'));
  } catch (err) {
    console.warn('Could not clear user from localStorage:', err);
  }
}
