/**
 * Système de validation pour les entrées utilisateur
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valide un nom (pour revenus, dépenses, enveloppes)
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Le nom ne peut pas être vide',
    };
  }

  if (name.trim().length > 50) {
    return {
      valid: false,
      error: 'Le nom ne peut pas dépasser 50 caractères',
    };
  }

  return { valid: true };
}

/**
 * Valide un montant financier
 */
export function validateAmount(amount: number | string): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return {
      valid: false,
      error: 'Le montant doit être un nombre valide',
    };
  }

  if (numAmount < 0) {
    return {
      valid: false,
      error: 'Le montant ne peut pas être négatif',
    };
  }

  if (numAmount > 999999999) {
    return {
      valid: false,
      error: 'Le montant est trop élevé',
    };
  }

  return { valid: true };
}

/**
 * Valide un pourcentage (0-100)
 */
export function validatePercentage(percentage: number | string): ValidationResult {
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

  if (isNaN(numPercentage)) {
    return {
      valid: false,
      error: 'Le pourcentage doit être un nombre valide',
    };
  }

  if (numPercentage < 0) {
    return {
      valid: false,
      error: 'Le pourcentage ne peut pas être négatif',
    };
  }

  if (numPercentage > 100) {
    return {
      valid: false,
      error: 'Le pourcentage ne peut pas dépasser 100%',
    };
  }

  return { valid: true };
}

/**
 * Valide un mois (format YYYY-MM)
 */
export function validateMonth(month: string): ValidationResult {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return {
      valid: false,
      error: 'Format de mois invalide (attendu: YYYY-MM)',
    };
  }

  const [year, monthNum] = month.split('-').map(Number);

  if (year < 2000 || year > 2100) {
    return {
      valid: false,
      error: 'Année invalide',
    };
  }

  if (monthNum < 1 || monthNum > 12) {
    return {
      valid: false,
      error: 'Mois invalide (1-12)',
    };
  }

  return { valid: true };
}

/**
 * Valide un email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      valid: false,
      error: 'L\'email ne peut pas être vide',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Format d\'email invalide',
    };
  }

  return { valid: true };
}

/**
 * Valide que la somme des pourcentages fait 100%
 */
export function validateTotalPercentage(
  percentages: number[],
  tolerance: number = 0.01
): ValidationResult {
  const total = percentages.reduce((sum, p) => sum + p, 0);

  if (Math.abs(total - 100) > tolerance) {
    return {
      valid: false,
      error: `La somme des pourcentages doit être 100% (actuellement: ${total.toFixed(1)}%)`,
    };
  }

  return { valid: true };
}

/**
 * Valide qu'au moins un élément existe dans un tableau
 */
export function validateNotEmpty<T>(
  array: T[],
  itemName: string = 'élément'
): ValidationResult {
  if (!array || array.length === 0) {
    return {
      valid: false,
      error: `Au moins un ${itemName} est requis`,
    };
  }

  return { valid: true };
}

/**
 * Valide un objet avec plusieurs champs
 */
export function validateMultiple(
  validations: ValidationResult[]
): ValidationResult {
  const errors = validations
    .filter((v) => !v.valid)
    .map((v) => v.error)
    .filter((e): e is string => !!e);

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join(', '),
    };
  }

  return { valid: true };
}

/**
 * Sanitize une chaîne de caractères (évite XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprime les balises HTML basiques
    .substring(0, 500); // Limite la longueur
}

/**
 * Formate un nombre pour l'affichage (2 décimales max)
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toFixed(2).replace(/\.?0+$/, '');
}
