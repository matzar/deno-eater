import { Broker1Document, Broker2Document } from '@/app/api/brokers/types';

// API Response types
interface BrokerApiResponse {
  success: boolean;
  documents?: (Broker1Document | Broker2Document)[];
  documentCount?: number;
  error?: string;
  source?: string;
}

// Standardized field mapping interface
interface StandardizedPolicy {
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

// Helper function to safely parse numeric values
function safeParseNumber(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 'TBC' ||
    value === 'Not Known'
  ) {
    return 0;
  }
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Field mapping functions
function standardizeBroker1Data(document: Broker1Document): StandardizedPolicy {
  return {
    id: document._id,
    source: 'broker1',
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
}

function standardizeBroker2Data(document: Broker2Document): StandardizedPolicy {
  return {
    id: document._id,
    source: 'broker2',
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
}

/**
 * @swagger
 * /api/brokers/standardized:
 *   get:
 *     summary: Get Standardized Broker Data
 *     description: >
 *       Fetches data from both broker collections, standardizes it into a unified format,
 *       and returns the combined list with pagination, filtering, and comprehensive statistics.
 *     tags:
 *       - Standardized Data
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [broker1, broker2]
 *         description: Optional. Filter by data source (broker1, broker2, or both if omitted)
 *       - in: query
 *         name: policyType
 *         schema:
 *           type: string
 *         description: Optional. Filter policies by their type
 *       - in: query
 *         name: clientType
 *         schema:
 *           type: string
 *         description: Optional. Filter policies by client type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional. Search term to filter by policy number, business description, insurer, or client reference
 *     responses:
 *       200:
 *         description: Successfully retrieved standardized policy data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       source:
 *                         type: string
 *                         enum: [broker1, broker2]
 *                       policyNumber:
 *                         type: string
 *                       insuredAmount:
 *                         type: number
 *                       premium:
 *                         type: number
 *                       policyType:
 *                         type: string
 *                       clientType:
 *                         type: string
 *                       insurer:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 statistics:
 *                   type: object
 *                   description: Comprehensive statistics about the filtered data
 *                 metadata:
 *                   type: object
 *                   description: Additional metadata about data quality and sources
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '20');

    // Ensure valid pagination values with fallbacks
    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit =
      isNaN(limitParam) || limitParam < 1 || limitParam > 100 ? 20 : limitParam;

    const source = searchParams.get('source'); // 'broker1', 'broker2', or null for both
    const policyType = searchParams.get('policyType');
    const clientType = searchParams.get('clientType');
    const searchTerm = searchParams.get('search');

    // Make API calls to both broker endpoints
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://deno-eater.vercel.app/'
        : 'http://localhost:3000';

    const promises: Promise<BrokerApiResponse>[] = [];

    if (!source || source === 'broker1') {
      promises.push(
        fetch(`${baseUrl}/api/broker1`)
          .then((res) => res.json() as Promise<BrokerApiResponse>)
          .catch(
            (err): BrokerApiResponse => ({
              success: false,
              error: err.message,
              source: 'broker1',
            }),
          ),
      );
    }

    if (!source || source === 'broker2') {
      promises.push(
        fetch(`${baseUrl}/api/broker2`)
          .then((res) => res.json() as Promise<BrokerApiResponse>)
          .catch(
            (err): BrokerApiResponse => ({
              success: false,
              error: err.message,
              source: 'broker2',
            }),
          ),
      );
    }

    const results: BrokerApiResponse[] = await Promise.all(promises);

    // Combine and standardize data
    let standardizedData: StandardizedPolicy[] = [];

    results.forEach((result, index) => {
      if (result.success && result.documents) {
        const isFirstResult = index === 0;
        const isBroker1 = (!source && isFirstResult) || source === 'broker1';

        const standardized = result.documents
          .filter(
            (doc): doc is Broker1Document | Broker2Document =>
              doc && Object.keys(doc).length > 1,
          ) // Filter out incomplete documents
          .map((doc) => {
            try {
              return isBroker1
                ? standardizeBroker1Data(doc as Broker1Document)
                : standardizeBroker2Data(doc as Broker2Document);
            } catch (error) {
              console.error('Error standardizing document:', error, doc);
              return null;
            }
          })
          .filter((doc): doc is StandardizedPolicy => doc !== null);

        standardizedData = [...standardizedData, ...standardized];
      }
    });

    // Helper function to parse dates in DD/MM/YYYY format
    const parseDate = (dateString: string): Date | null => {
      if (!dateString || dateString.toLowerCase() === 'not known') return null;

      const dateParts = dateString.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const year = parseInt(dateParts[2]);
        return new Date(year, month, day);
      }
      return null;
    };

    // Helper function to check if a policy is active
    const isPolicyActive = (policy: StandardizedPolicy): boolean => {
      const currentDate = new Date();
      const startDate = parseDate(policy.startDate);
      const renewalDate = parseDate(policy.renewalDate);

      if (!startDate || !renewalDate) return false;

      // Active if start date has passed AND renewal date is in the future
      return startDate <= currentDate && renewalDate > currentDate;
    };

    // Helper function to calculate policy duration in days
    const calculatePolicyDuration = (
      policy: StandardizedPolicy,
    ): number | null => {
      const startDate = parseDate(policy.startDate);
      const endDate = parseDate(policy.endDate);

      if (!startDate || !endDate) return null;

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    // Filter active policies first for active policy statistics
    const activePolicies = standardizedData.filter(isPolicyActive);

    // Apply user filters to all data
    let filteredData = standardizedData;

    if (policyType) {
      filteredData = filteredData.filter(
        (policy) =>
          policy.policyType?.toLowerCase() === policyType.toLowerCase(),
      );
    }

    if (clientType) {
      filteredData = filteredData.filter(
        (policy) =>
          policy.clientType?.toLowerCase() === clientType.toLowerCase(),
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (policy) =>
          policy.policyNumber?.toLowerCase().includes(term) ||
          policy.businessDescription?.toLowerCase().includes(term) ||
          policy.insurer?.toLowerCase().includes(term) ||
          policy.clientRef?.toLowerCase().includes(term),
      );
    }

    // Sort by start date (most recent first)
    filteredData.sort((a, b) => {
      const dateA = new Date(a.startDate?.split('/').reverse().join('-') || '');
      const dateB = new Date(b.startDate?.split('/').reverse().join('-') || '');
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const totalCount = filteredData.length;
    const skip = (page - 1) * limit;
    const paginatedData = filteredData.slice(skip, skip + limit);

    // Calculate active policy statistics
    const activePolicyDurations = activePolicies
      .map(calculatePolicyDuration)
      .filter((duration): duration is number => duration !== null);

    const uniqueActiveCustomers = new Set(
      activePolicies.map((policy) => policy.clientRef).filter((ref) => ref),
    );

    const activePolicyStats = {
      totalActivePolicies: activePolicies.length,
      totalActiveCustomers: uniqueActiveCustomers.size,
      totalActiveInsuredAmount: activePolicies.reduce(
        (sum, policy) => sum + (policy.insuredAmount || 0),
        0,
      ),
      averageActivePolicyDuration:
        activePolicyDurations.length > 0
          ? Math.round(
              activePolicyDurations.reduce(
                (sum, duration) => sum + duration,
                0,
              ) / activePolicyDurations.length,
            )
          : 0,
      activePoliciesBySource: {
        broker1: activePolicies.filter((p) => p.source === 'broker1').length,
        broker2: activePolicies.filter((p) => p.source === 'broker2').length,
      },
    };

    // Calculate summary statistics for filtered data (all policies matching user filters)
    const stats = {
      totalPolicies: totalCount,
      totalInsuredAmount: filteredData.reduce(
        (sum, policy) => sum + (policy.insuredAmount || 0),
        0,
      ),
      averageInsuredAmount:
        totalCount > 0
          ? filteredData.reduce(
              (sum, policy) => sum + (policy.insuredAmount || 0),
              0,
            ) / totalCount
          : 0,
      totalPremium: filteredData.reduce(
        (sum, policy) => sum + (policy.premium || 0),
        0,
      ),
      averagePremium:
        totalCount > 0
          ? filteredData.reduce(
              (sum, policy) => sum + (policy.premium || 0),
              0,
            ) / totalCount
          : 0,
      policyTypeBreakdown: {} as Record<string, number>,
      clientTypeBreakdown: {} as Record<string, number>,
      sourceBreakdown: {
        broker1: filteredData.filter((p) => p.source === 'broker1').length,
        broker2: filteredData.filter((p) => p.source === 'broker2').length,
      },
      activePolicies: activePolicyStats,
    };

    // Calculate breakdowns
    filteredData.forEach((policy) => {
      // Policy type breakdown
      if (policy.policyType) {
        stats.policyTypeBreakdown[policy.policyType] =
          (stats.policyTypeBreakdown[policy.policyType] || 0) + 1;
      }

      // Client type breakdown
      if (policy.clientType) {
        stats.clientTypeBreakdown[policy.clientType] =
          (stats.clientTypeBreakdown[policy.clientType] || 0) + 1;
      }
    });

    return Response.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      statistics: stats,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalPoliciesAcrossAllSources: standardizedData.length,
        activePoliciesPercentage:
          standardizedData.length > 0
            ? Math.round(
                (activePolicies.length / standardizedData.length) * 100,
              )
            : 0,
        dataQuality: {
          policiesWithValidDates: standardizedData.filter(
            (p) => parseDate(p.startDate) && parseDate(p.renewalDate),
          ).length,
          policiesWithMissingData: standardizedData.filter(
            (p) => !parseDate(p.startDate) || !parseDate(p.renewalDate),
          ).length,
        },
        sources: results.map((result, index) => ({
          source:
            (!source && index === 0) || source === 'broker1'
              ? 'broker1'
              : 'broker2',
          success: result.success,
          documentCount: result.documentCount || 0,
          error: result.error || null,
        })),
      },
      message: 'Standardized broker data retrieved successfully',
    });
  } catch (error) {
    console.error('Error in standardized API:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve standardized broker data',
      },
      { status: 500 },
    );
  }
}
