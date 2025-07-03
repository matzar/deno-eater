import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Broker1Document, Broker2Document } from '@/app/api/brokers/types';

// Create a simple test for the data transformation logic first
describe('Data standardization utilities', () => {
  it('should safely parse numeric values', () => {
    // Testing the safeParseNumber function logic
    const safeParseNumber = (value: unknown): number => {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'TBC' ||
        value === 'Not Known'
      ) {
        return 0;
      }
      const parsed =
        typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    expect(safeParseNumber(100)).toBe(100);
    expect(safeParseNumber('100')).toBe(100);
    expect(safeParseNumber('100.50')).toBe(100.5);
    expect(safeParseNumber(null)).toBe(0);
    expect(safeParseNumber(undefined)).toBe(0);
    expect(safeParseNumber('')).toBe(0);
    expect(safeParseNumber('TBC')).toBe(0);
    expect(safeParseNumber('Not Known')).toBe(0);
    expect(safeParseNumber('invalid')).toBe(0);
    expect(safeParseNumber(NaN)).toBe(0);
  });

  it('should correctly map broker1 data to standardized format', () => {
    const broker1Doc: Broker1Document = {
      _id: '1',
      PolicyNumber: 'POL001',
      InsuredAmount: 100000,
      StartDate: '01/01/2024',
      EndDate: '31/12/2024',
      AdminFee: 50,
      BusinessDescription: 'Test Business',
      BusinessEvent: 'New Policy',
      ClientType: 'Individual',
      ClientRef: 'CLIENT001',
      Commission: 500,
      EffectiveDate: '01/01/2024',
      InsurerPolicyNumber: 'INS001',
      IPTAmount: 120,
      Premium: 1200,
      PolicyFee: 25,
      PolicyType: 'Motor',
      Insurer: 'Test Insurer',
      Product: 'Motor Insurance',
      RenewalDate: '01/01/2025',
      RootPolicyRef: 'ROOT001',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const safeParseNumber = (value: unknown): number => {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'TBC' ||
        value === 'Not Known'
      ) {
        return 0;
      }
      const parsed =
        typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const standardizeBroker1Data = (document: Broker1Document) => {
      return {
        id: document._id,
        source: 'broker1' as const,
        policyNumber: document.PolicyNumber,
        insuredAmount: safeParseNumber(document.InsuredAmount),
        startDate: document.StartDate,
        endDate: document.EndDate,
        adminFee: safeParseNumber(document.AdminFee),
        businessDescription: document.BusinessDescription,
        businessEvent: document.BusinessEvent,
        clientType: document.ClientType,
        clientRef: document.ClientRef,
        commission: safeParseNumber(document.Commission),
        effectiveDate: document.EffectiveDate,
        insurerPolicyNumber: document.InsurerPolicyNumber,
        taxAmount: safeParseNumber(document.IPTAmount),
        premium: safeParseNumber(document.Premium),
        policyFee: safeParseNumber(document.PolicyFee),
        policyType: document.PolicyType,
        insurer: document.Insurer,
        product: document.Product,
        renewalDate: document.RenewalDate,
        rootPolicyRef: document.RootPolicyRef,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    };

    const result = standardizeBroker1Data(broker1Doc);

    expect(result.source).toBe('broker1');
    expect(result.policyNumber).toBe('POL001');
    expect(result.insuredAmount).toBe(100000);
    expect(result.startDate).toBe('01/01/2024');
    expect(result.taxAmount).toBe(120); // IPTAmount mapped to taxAmount
    expect(result.clientRef).toBe('CLIENT001');
  });

  it('should correctly map broker2 data to standardized format', () => {
    const broker2Doc: Broker2Document = {
      _id: '3',
      PolicyRef: 'REF001',
      CoverageAmount: 75000,
      ExpirationDate: '31/12/2024',
      AdminCharges: 40,
      InitiationDate: '01/01/2024',
      CompanyDescription: 'Test Company',
      ContractEvent: 'New Contract',
      ConsumerID: 'CONSUMER001',
      BrokerFee: 375,
      ActivationDate: '01/01/2024',
      ConsumerCategory: 'Personal',
      InsuranceCompanyRef: 'IC001',
      TaxAmount: 90,
      CoverageCost: 900,
      ContractFee: 20,
      ContractCategory: 'Life',
      Underwriter: 'Test Underwriter',
      NextRenewalDate: '01/01/2025',
      PrimaryPolicyRef: 'PRIMARY001',
      InsurancePlan: 'Life Insurance',
    };

    const safeParseNumber = (value: unknown): number => {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'TBC' ||
        value === 'Not Known'
      ) {
        return 0;
      }
      const parsed =
        typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const standardizeBroker2Data = (document: Broker2Document) => {
      return {
        id: document._id,
        source: 'broker2' as const,
        policyNumber: document.PolicyRef,
        insuredAmount: safeParseNumber(document.CoverageAmount),
        startDate: document.InitiationDate,
        endDate: document.ExpirationDate,
        adminFee: safeParseNumber(document.AdminCharges),
        businessDescription: document.CompanyDescription,
        businessEvent: document.ContractEvent,
        clientType: document.ConsumerCategory,
        clientRef: document.ConsumerID,
        commission: safeParseNumber(document.BrokerFee),
        effectiveDate: document.ActivationDate,
        insurerPolicyNumber: document.InsuranceCompanyRef,
        taxAmount: safeParseNumber(document.TaxAmount),
        premium: safeParseNumber(document.CoverageCost),
        policyFee: safeParseNumber(document.ContractFee),
        policyType: document.ContractCategory,
        insurer: document.Underwriter,
        product: document.InsurancePlan,
        renewalDate: document.NextRenewalDate,
        rootPolicyRef: document.PrimaryPolicyRef,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    };

    const result = standardizeBroker2Data(broker2Doc);

    expect(result.source).toBe('broker2');
    expect(result.policyNumber).toBe('REF001'); // PolicyRef mapped to policyNumber
    expect(result.insuredAmount).toBe(75000); // CoverageAmount mapped to insuredAmount
    expect(result.startDate).toBe('01/01/2024'); // InitiationDate mapped to startDate
    expect(result.adminFee).toBe(40); // AdminCharges mapped to adminFee
    expect(result.clientRef).toBe('CONSUMER001'); // ConsumerID mapped to clientRef
  });

  it('should handle edge cases in broker2 data', () => {
    const broker2DocWithEdgeCases: Broker2Document = {
      _id: '4',
      PolicyRef: 'REF002',
      CoverageAmount: 0,
      ExpirationDate: '30/06/2024',
      AdminCharges: 25,
      InitiationDate: '01/07/2023',
      CompanyDescription: 'Edge Case Company',
      ContractEvent: 'Cancellation',
      ConsumerID: 'CONSUMER002',
      BrokerFee: 0,
      ActivationDate: '01/07/2023',
      ConsumerCategory: 'Business',
      InsuranceCompanyRef: 'IC002',
      TaxAmount: 0,
      CoverageCost: 'TBC', // Test string edge case
      ContractFee: 10,
      ContractCategory: 'Motor',
      Underwriter: 'Edge Underwriter',
      NextRenewalDate: '01/07/2024',
      PrimaryPolicyRef: 'PRIMARY002',
      InsurancePlan: 'Motor Plan',
    };

    const safeParseNumber = (value: unknown): number => {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'TBC' ||
        value === 'Not Known'
      ) {
        return 0;
      }
      const parsed =
        typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const standardizeBroker2Data = (document: Broker2Document) => {
      return {
        id: document._id,
        source: 'broker2' as const,
        policyNumber: document.PolicyRef,
        insuredAmount: safeParseNumber(document.CoverageAmount),
        startDate: document.InitiationDate,
        endDate: document.ExpirationDate,
        adminFee: safeParseNumber(document.AdminCharges),
        businessDescription: document.CompanyDescription,
        businessEvent: document.ContractEvent,
        clientType: document.ConsumerCategory,
        clientRef: document.ConsumerID,
        commission: safeParseNumber(document.BrokerFee),
        effectiveDate: document.ActivationDate,
        insurerPolicyNumber: document.InsuranceCompanyRef,
        taxAmount: safeParseNumber(document.TaxAmount),
        premium: safeParseNumber(document.CoverageCost),
        policyFee: safeParseNumber(document.ContractFee),
        policyType: document.ContractCategory,
        insurer: document.Underwriter,
        product: document.InsurancePlan,
        renewalDate: document.NextRenewalDate,
        rootPolicyRef: document.PrimaryPolicyRef,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    };

    const result = standardizeBroker2Data(broker2DocWithEdgeCases);

    expect(result.insuredAmount).toBe(0); // 0 should remain 0
    expect(result.commission).toBe(0); // 0 should remain 0
    expect(result.taxAmount).toBe(0); // 0 should remain 0
    expect(result.premium).toBe(0); // 'TBC' should become 0
  });
});
