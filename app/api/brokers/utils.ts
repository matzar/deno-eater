/**
 * Utility functions for standardizing broker data
 */

// Field mapping reference
export const FIELD_MAPPING = {
  broker1: {
    policyNumber: 'PolicyNumber',
    insuredAmount: 'InsuredAmount',
    startDate: 'StartDate',
    endDate: 'EndDate',
    adminFee: 'AdminFee',
    businessDescription: 'BusinessDescription',
    businessEvent: 'BusinessEvent',
    clientType: 'ClientType',
    clientRef: 'ClientRef',
    commission: 'Commission',
    effectiveDate: 'EffectiveDate',
    insurerPolicyNumber: 'InsurerPolicyNumber',
    taxAmount: 'IPTAmount',
    premium: 'Premium',
    policyFee: 'PolicyFee',
    policyType: 'PolicyType',
    insurer: 'Insurer',
    product: 'Product',
    renewalDate: 'RenewalDate',
    rootPolicyRef: 'RootPolicyRef',
  },
  broker2: {
    policyNumber: 'PolicyRef',
    insuredAmount: 'CoverageAmount',
    startDate: 'InitiationDate',
    endDate: 'ExpirationDate',
    adminFee: 'AdminCharges',
    businessDescription: 'CompanyDescription',
    businessEvent: 'ContractEvent',
    clientType: 'ConsumerCategory',
    clientRef: 'ConsumerID',
    commission: 'BrokerFee',
    effectiveDate: 'ActivationDate',
    insurerPolicyNumber: 'InsuranceCompanyRef',
    taxAmount: 'TaxAmount',
    premium: 'CoverageCost',
    policyFee: 'ContractFee',
    policyType: 'ContractCategory',
    insurer: 'Underwriter',
    product: 'InsurancePlan',
    renewalDate: 'NextRenewalDate',
    rootPolicyRef: 'PrimaryPolicyRef',
  },
};

// Helper function to safely parse dates
export function parseDate(dateString: string): Date | null {
  if (!dateString || dateString === 'Not Known') return null;

  // Try different date formats
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        // DD/MM/YYYY or DD-MM-YYYY
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // YYYY-MM-DD
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
  }

  return null;
}

// Helper function to format currency
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Helper function to validate policy data
export function validatePolicyData(policy: Record<string, unknown>): boolean {
  const requiredFields = ['policyNumber', 'insuredAmount', 'startDate'];
  return requiredFields.every(
    (field) => policy[field] !== undefined && policy[field] !== null,
  );
}
