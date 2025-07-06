/**
 * Utility functions for contribution calculations and formatting
 */

/**
 * Format currency values consistently across the application
 */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

/**
 * Calculate RRSP tax refund estimate
 */
export function calculateRRSPTaxRefund(contribution: number, marginalTaxRate: number): number {
  if (typeof contribution !== 'number' || typeof marginalTaxRate !== 'number') {
    return 0;
  }
  
  return contribution * (marginalTaxRate / 100);
}

/**
 * Calculate remaining contribution room
 */
export function calculateRemainingRoom(totalRoom: number, contributions: number): number {
  if (typeof totalRoom !== 'number' || typeof contributions !== 'number') {
    return 0;
  }
  
  return Math.max(0, totalRoom - contributions);
}

/**
 * Validate contribution amount against available room
 */
export function validateContribution(amount: number, availableRoom: number): {
  isValid: boolean;
  message?: string;
} {
  if (typeof amount !== 'number' || typeof availableRoom !== 'number') {
    return { isValid: false, message: 'Invalid input values' };
  }
  
  if (amount <= 0) {
    return { isValid: false, message: 'Contribution amount must be greater than zero' };
  }
  
  if (amount > availableRoom) {
    return { 
      isValid: false, 
      message: `Contribution exceeds available room by ${formatCurrency(amount - availableRoom)}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Calculate pension adjustment impact on RRSP room
 */
export function calculatePensionAdjustment(rppContribution: number, dpspContribution: number): number {
  if (typeof rppContribution !== 'number' || typeof dpspContribution !== 'number') {
    return 0;
  }
  
  // Simplified calculation - in reality this would be more complex
  return (rppContribution + dpspContribution) * 9; // Approximate factor
}

/**
 * Get marginal tax rate by province and income
 */
export function getMarginalTaxRate(province: string, income: number): number {
  // Simplified tax rates for 2024 - in a real app this would be more comprehensive
  const taxRates: Record<string, { threshold: number; rate: number }[]> = {
    'Ontario': [
      { threshold: 0, rate: 20.05 },
      { threshold: 50197, rate: 24.15 },
      { threshold: 100392, rate: 31.48 },
      { threshold: 155625, rate: 43.41 },
      { threshold: 220000, rate: 46.16 }
    ],
    'British Columbia': [
      { threshold: 0, rate: 20.06 },
      { threshold: 47937, rate: 22.70 },
      { threshold: 50197, rate: 28.20 },
      { threshold: 100392, rate: 35.53 },
      { threshold: 155625, rate: 47.46 },
      { threshold: 220000, rate: 50.21 }
    ],
    'Alberta': [
      { threshold: 0, rate: 25.00 },
      { threshold: 50197, rate: 30.50 },
      { threshold: 100392, rate: 36.83 },
      { threshold: 155625, rate: 44.67 },
      { threshold: 220000, rate: 47.42 }
    ]
    // Add more provinces as needed
  };

  const provinceTaxRates = taxRates[province] || taxRates['Ontario']; // Default to Ontario
  
  for (let i = provinceTaxRates.length - 1; i >= 0; i--) {
    if (income >= provinceTaxRates[i].threshold) {
      return provinceTaxRates[i].rate;
    }
  }
  
  return provinceTaxRates[0].rate;
}

/**
 * Calculate optimal contribution strategy
 */
export function calculateOptimalContribution(
  rrspRoom: number,
  tfsaRoom: number,
  fhsaRoom: number,
  availableFunds: number,
  marginalTaxRate: number
): {
  rrsp: number;
  tfsa: number;
  fhsa: number;
  strategy: string;
} {
  let remaining = availableFunds;
  let rrsp = 0;
  let tfsa = 0;
  let fhsa = 0;
  let strategy = '';

  // Strategy: FHSA first (if eligible), then RRSP if high tax bracket, then TFSA
  if (fhsaRoom > 0 && remaining > 0) {
    fhsa = Math.min(fhsaRoom, remaining);
    remaining -= fhsa;
    strategy += 'FHSA for home purchase benefits. ';
  }

  if (marginalTaxRate >= 30 && rrspRoom > 0 && remaining > 0) {
    rrsp = Math.min(rrspRoom, remaining);
    remaining -= rrsp;
    strategy += 'RRSP for tax deduction. ';
  }

  if (tfsaRoom > 0 && remaining > 0) {
    tfsa = Math.min(tfsaRoom, remaining);
    remaining -= tfsa;
    strategy += 'TFSA for tax-free growth. ';
  }

  if (marginalTaxRate < 30 && rrspRoom > 0 && remaining > 0) {
    rrsp = Math.min(rrspRoom, remaining);
    remaining -= rrsp;
    strategy += 'RRSP for retirement savings. ';
  }

  return { rrsp, tfsa, fhsa, strategy: strategy.trim() };
}

/**
 * Format date consistently
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('en-CA');
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  if (!dateOfBirth) return 0;
  
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return 0;
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

/**
 * Check if contribution is within first 60 days of year (for RRSP)
 */
export function isWithinFirstContributionPeriod(date: Date | string): boolean {
  if (!date) return false;
  
  const contributionDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(contributionDate.getTime())) {
    return false;
  }
  
  const year = contributionDate.getFullYear();
  const march1 = new Date(year, 2, 1); // March 1st (month is 0-indexed)
  
  return contributionDate < march1;
}