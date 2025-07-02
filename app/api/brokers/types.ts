/**
 * Type definitions for broker data standardization
 */

// Raw broker data types
export interface Broker1Document {
  _id: string;
  PolicyNumber: string;
  InsuredAmount: number;
  StartDate: string;
  EndDate: string;
  AdminFee: number;
  BusinessDescription: string;
  BusinessEvent: string;
  ClientType: string;
  ClientRef: string;
  Commission: number;
  EffectiveDate: string;
  InsurerPolicyNumber: string;
  IPTAmount: number;
  Premium: number;
  PolicyFee: number;
  PolicyType: string;
  Insurer: string;
  Product: string;
  RenewalDate: string;
  RootPolicyRef: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Broker2Document {
  _id: string;
  PolicyRef: string;
  CoverageAmount: number;
  ExpirationDate: string;
  AdminCharges: number;
  InitiationDate: string;
  CompanyDescription: string;
  ContractEvent: string;
  ConsumerID: string;
  BrokerFee: number;
  ActivationDate: string;
  ConsumerCategory: string;
  InsuranceCompanyRef: string;
  TaxAmount: number;
  CoverageCost: number | string; // Can be "TBC" in some cases
  ContractFee: number;
  ContractCategory: string;
  Underwriter: string;
  NextRenewalDate: string;
  PrimaryPolicyRef: string;
  InsurancePlan: string;
  createdAt?: string;
  updatedAt?: string;
}

// Standardized policy interface
export interface StandardizedPolicy {
  id: string;
  source: 'broker1' | 'broker2';
  policyNumber: string;
  insuredAmount: number;
  startDate: string;
  endDate: string;
  adminFee: number;
  businessDescription: string;
  businessEvent: string;
  clientType: string;
  clientRef: string;
  commission: number;
  effectiveDate: string;
  insurerPolicyNumber: string;
  taxAmount: number;
  premium: number;
  policyFee: number;
  policyType: string;
  insurer: string;
  product: string;
  renewalDate: string;
  rootPolicyRef: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface BrokerApiResponse {
  success: boolean;
  documentCount?: number;
  documents?: (Broker1Document | Broker2Document)[];
  message: string;
  error?: string;
}

export interface StandardizedApiResponse {
  success: boolean;
  data: StandardizedPolicy[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics: {
    totalPolicies: number;
    totalInsuredAmount: number;
    averageInsuredAmount: number;
    totalPremium: number;
    averagePremium: number;
    policyTypeBreakdown: Record<string, number>;
    clientTypeBreakdown: Record<string, number>;
    sourceBreakdown: {
      broker1: number;
      broker2: number;
    };
  };
  metadata: {
    lastUpdated: string;
    sources: Array<{
      source: 'broker1' | 'broker2';
      success: boolean;
      documentCount: number;
      error: string | null;
    }>;
  };
  message: string;
}

// Filter options
export interface StandardizedApiFilters {
  page?: number;
  limit?: number;
  source?: 'broker1' | 'broker2';
  policyType?: string;
  clientType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
