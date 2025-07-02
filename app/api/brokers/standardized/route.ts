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

// Field mapping functions
function standardizeBroker1Data(document: any): StandardizedPolicy {
  return {
    id: document._id,
    source: 'broker1',
    policyNumber: document.PolicyNumber,
    insuredAmount: document.InsuredAmount,
    startDate: document.StartDate,
    endDate: document.EndDate,
    adminFee: document.AdminFee,
    businessDescription: document.BusinessDescription,
    businessEvent: document.BusinessEvent,
    clientType: document.ClientType,
    clientRef: document.ClientRef,
    commission: document.Commission,
    effectiveDate: document.EffectiveDate,
    insurerPolicyNumber: document.InsurerPolicyNumber,
    taxAmount: document.IPTAmount,
    premium: document.Premium,
    policyFee: document.PolicyFee,
    policyType: document.PolicyType,
    insurer: document.Insurer,
    product: document.Product,
    renewalDate: document.RenewalDate,
    rootPolicyRef: document.RootPolicyRef,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function standardizeBroker2Data(document: any): StandardizedPolicy {
  return {
    id: document._id,
    source: 'broker2',
    policyNumber: document.PolicyRef,
    insuredAmount: document.CoverageAmount,
    startDate: document.InitiationDate,
    endDate: document.ExpirationDate,
    adminFee: document.AdminCharges,
    businessDescription: document.CompanyDescription,
    businessEvent: document.ContractEvent,
    clientType: document.ConsumerCategory,
    clientRef: document.ConsumerID,
    commission: document.BrokerFee,
    effectiveDate: document.ActivationDate,
    insurerPolicyNumber: document.InsuranceCompanyRef,
    taxAmount: document.TaxAmount,
    premium: document.CoverageCost,
    policyFee: document.ContractFee,
    policyType: document.ContractCategory,
    insurer: document.Underwriter,
    product: document.InsurancePlan,
    renewalDate: document.NextRenewalDate,
    rootPolicyRef: document.PrimaryPolicyRef,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const source = searchParams.get('source'); // 'broker1', 'broker2', or null for both
    const policyType = searchParams.get('policyType');
    const clientType = searchParams.get('clientType');
    const searchTerm = searchParams.get('search');

    // Make API calls to both broker endpoints
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com'
        : 'http://localhost:3000';

    const promises = [];

    if (!source || source === 'broker1') {
      promises.push(
        fetch(`${baseUrl}/api/broker1`)
          .then((res) => res.json())
          .catch((err) => ({
            success: false,
            error: err.message,
            source: 'broker1',
          })),
      );
    }

    if (!source || source === 'broker2') {
      promises.push(
        fetch(`${baseUrl}/api/broker2`)
          .then((res) => res.json())
          .catch((err) => ({
            success: false,
            error: err.message,
            source: 'broker2',
          })),
      );
    }

    const results = await Promise.all(promises);

    // Combine and standardize data
    let standardizedData: StandardizedPolicy[] = [];

    results.forEach((result, index) => {
      if (result.success && result.documents) {
        const isFirstResult = index === 0;
        const isBroker1 = (!source && isFirstResult) || source === 'broker1';

        const standardized = result.documents
          .filter((doc: any) => doc && Object.keys(doc).length > 1) // Filter out incomplete documents
          .map((doc: any) => {
            try {
              return isBroker1
                ? standardizeBroker1Data(doc)
                : standardizeBroker2Data(doc);
            } catch (error) {
              console.error('Error standardizing document:', error, doc);
              return null;
            }
          })
          .filter((doc: any) => doc !== null);

        standardizedData = [...standardizedData, ...standardized];
      }
    });

    // Apply filters
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

    // Calculate summary statistics
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
