import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/brokers/standardized/route';
import { Broker1Document, Broker2Document } from '@/app/api/brokers/types';

// Use the global fetch mock from vitest setup
const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

// Mock data
const mockBroker1Data: Broker1Document[] = [
  {
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
  },
  {
    _id: '2',
    PolicyNumber: 'POL002',
    InsuredAmount: 50000,
    StartDate: '15/06/2024',
    EndDate: '14/06/2025',
    AdminFee: 30,
    BusinessDescription: 'Another Business',
    BusinessEvent: 'Renewal',
    ClientType: 'Commercial',
    ClientRef: 'CLIENT002',
    Commission: 250,
    EffectiveDate: '15/06/2024',
    InsurerPolicyNumber: 'INS002',
    IPTAmount: 60,
    Premium: 600,
    PolicyFee: 15,
    PolicyType: 'Property',
    Insurer: 'Another Insurer',
    Product: 'Property Insurance',
    RenewalDate: '15/06/2025',
    RootPolicyRef: 'ROOT002',
  },
];

const mockBroker2Data: Broker2Document[] = [
  {
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
  },
  {
    _id: '4',
    PolicyRef: 'REF002',
    CoverageAmount: 0, // Test edge case with 0 value
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
  },
];

describe('/api/brokers/standardized', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful data retrieval', () => {
    it('should successfully retrieve and standardize data from both brokers', async () => {
      // Mock successful responses from both broker APIs
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker1Data,
              documentCount: mockBroker1Data.length,
            }),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker2Data,
              documentCount: mockBroker2Data.length,
            }),
          ok: true,
        } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(4);
      expect(data.pagination.totalCount).toBe(4);
      expect(data.statistics.totalPolicies).toBe(4);
      expect(data.statistics.sourceBreakdown.broker1).toBe(2);
      expect(data.statistics.sourceBreakdown.broker2).toBe(2);
    });

    it('should correctly standardize broker1 data format', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            documents: [mockBroker1Data[0]],
            documentCount: 1,
          }),
        ok: true,
      } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?source=broker1',
      );
      const response = await GET(request);
      const data = await response.json();

      const policy = data.data[0];
      expect(policy.source).toBe('broker1');
      expect(policy.policyNumber).toBe('POL001');
      expect(policy.insuredAmount).toBe(100000);
      expect(policy.startDate).toBe('01/01/2024');
      expect(policy.taxAmount).toBe(120); // IPTAmount mapped to taxAmount
      expect(policy.clientRef).toBe('CLIENT001');
    });

    it('should correctly standardize broker2 data format', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            documents: [mockBroker2Data[0]],
            documentCount: 1,
          }),
        ok: true,
      } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?source=broker2',
      );
      const response = await GET(request);
      const data = await response.json();

      const policy = data.data[0];
      expect(policy.source).toBe('broker2');
      expect(policy.policyNumber).toBe('REF001'); // PolicyRef mapped to policyNumber
      expect(policy.insuredAmount).toBe(75000); // CoverageAmount mapped to insuredAmount
      expect(policy.startDate).toBe('01/01/2024'); // InitiationDate mapped to startDate
      expect(policy.adminFee).toBe(40); // AdminCharges mapped to adminFee
      expect(policy.clientRef).toBe('CONSUMER001'); // ConsumerID mapped to clientRef
    });
  });

  describe('Data filtering and pagination', () => {
    beforeEach(() => {
      // Setup mock for all tests in this group
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker1Data,
              documentCount: mockBroker1Data.length,
            }),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker2Data,
              documentCount: mockBroker2Data.length,
            }),
          ok: true,
        } as Response);
    });

    it('should filter by policy type', async () => {
      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?policyType=Motor',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(2); // Both Motor policies
      data.data.forEach((policy: any) => {
        expect(policy.policyType).toBe('Motor');
      });
    });

    it('should filter by client type', async () => {
      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?clientType=Individual',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].clientType).toBe('Individual');
    });

    it('should filter by search term', async () => {
      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?search=POL001',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].policyNumber).toBe('POL001');
    });

    it('should handle pagination correctly', async () => {
      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?page=1&limit=2',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.totalCount).toBe(4);
      expect(data.pagination.totalPages).toBe(2);
      expect(data.pagination.hasNextPage).toBe(true);
      expect(data.pagination.hasPrevPage).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle API failures gracefully', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Broker1 API failed'))
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker2Data,
              documentCount: mockBroker2Data.length,
            }),
          ok: true,
        } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2); // Only broker2 data
      expect(data.metadata.sources).toHaveLength(2);
      expect(data.metadata.sources[0].success).toBe(false);
      expect(data.metadata.sources[1].success).toBe(true);
    });

    it('should handle invalid numeric values', async () => {
      const invalidData = [
        {
          ...mockBroker2Data[0],
          CoverageAmount: 'invalid',
          BrokerFee: null,
          TaxAmount: undefined,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            documents: invalidData,
            documentCount: 1,
          }),
        ok: true,
      } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?source=broker2',
      );
      const response = await GET(request);
      const data = await response.json();

      const policy = data.data[0];
      expect(policy.insuredAmount).toBe(0); // Invalid string should become 0
      expect(policy.commission).toBe(0); // null should become 0
      expect(policy.taxAmount).toBe(0); // undefined should become 0
    });

    it('should handle empty responses', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: [],
              documentCount: 0,
            }),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: [],
              documentCount: 0,
            }),
          ok: true,
        } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
      expect(data.statistics.totalPolicies).toBe(0);
      expect(data.statistics.averageInsuredAmount).toBe(0);
    });

    it('should handle malformed request URLs', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker1Data,
              documentCount: mockBroker1Data.length,
            }),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker2Data,
              documentCount: mockBroker2Data.length,
            }),
          ok: true,
        } as Response);

      const request = new Request(
        'http://localhost:3000/api/brokers/standardized?page=invalid&limit=abc',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.pagination.page).toBe(1); // Default fallback
      expect(data.pagination.limit).toBe(20); // Default fallback
    });
  });

  describe('Statistics calculations', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker1Data,
              documentCount: mockBroker1Data.length,
            }),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              documents: mockBroker2Data,
              documentCount: mockBroker2Data.length,
            }),
          ok: true,
        } as Response);
    });

    it('should calculate correct statistics', async () => {
      const request = new Request(
        'http://localhost:3000/api/brokers/standardized',
      );
      const response = await GET(request);
      const data = await response.json();

      const stats = data.statistics;
      expect(stats.totalPolicies).toBe(4);
      expect(stats.totalInsuredAmount).toBe(225000); // 100000 + 50000 + 75000 + 0
      expect(stats.averageInsuredAmount).toBe(56250); // 225000 / 4
      expect(stats.totalPremium).toBe(2700); // 1200 + 600 + 900 + 0
      expect(stats.averagePremium).toBe(675); // 2700 / 4
    });

    it('should calculate correct breakdowns', async () => {
      const request = new Request(
        'http://localhost:3000/api/brokers/standardized',
      );
      const response = await GET(request);
      const data = await response.json();

      const stats = data.statistics;
      expect(stats.policyTypeBreakdown.Motor).toBe(2);
      expect(stats.policyTypeBreakdown.Property).toBe(1);
      expect(stats.policyTypeBreakdown.Life).toBe(1);

      expect(stats.clientTypeBreakdown.Individual).toBe(1);
      expect(stats.clientTypeBreakdown.Commercial).toBe(1);
      expect(stats.clientTypeBreakdown.Personal).toBe(1);
      expect(stats.clientTypeBreakdown.Business).toBe(1);
    });
  });
});
