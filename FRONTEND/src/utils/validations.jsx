// Regex pour email, nom et prenom, mot de passe

export const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;

export const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email) {
  if (!email) return "L'email est requis";
  if (!EMAIL_REGEX.test(email)) return "Email invalide (lettres, chiffres, @ et . uniquement)";
  return "";
}

export function validateName(name, fieldName = "Ce champ") {
  if (!name) return `${fieldName} est requis`;
  if (!NAME_REGEX.test(name)) return `${fieldName} doit contenir uniquement des lettres et espaces`;
  return "";
}

export function validatePassword(password) {
  if (!password) return "Le mot de passe est requis";
  if (password.length < MIN_PASSWORD_LENGTH) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`;
  return "";
}