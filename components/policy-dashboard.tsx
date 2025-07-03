'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { IconTrendingUp, IconSearch, IconFilter } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolicyCharts } from '@/components/policy-charts';
import { PolicyTable } from '@/components/policy-table';
import { StandardizedPolicy } from '@/app/api/brokers/types';

interface PolicyData {
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
    activePolicies: {
      totalActivePolicies: number;
      totalActiveCustomers: number;
      totalActiveInsuredAmount: number;
      averageActivePolicyDuration: number;
      activePoliciesBySource: {
        broker1: number;
        broker2: number;
      };
    };
  };
  metadata: {
    lastUpdated: string;
    totalPoliciesAcrossAllSources: number;
    activePoliciesPercentage: number;
    dataQuality: {
      policiesWithValidDates: number;
      policiesWithMissingData: number;
    };
    sources: Array<{
      source: string;
      success: boolean;
      documentCount: number;
      error: string | null;
    }>;
  };
}

interface PolicyFilters {
  page: number;
  limit: number;
  source: string;
  policyType: string;
  clientType: string;
  search: string;
}

export function PolicyDashboard() {
  const [data, setData] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullBreakdowns, setFullBreakdowns] = useState<{
    policyTypes: string[];
    clientTypes: string[];
  }>({ policyTypes: [], clientTypes: [] });
  const [filters, setFilters] = useState<PolicyFilters>({
    page: 1,
    limit: 20,
    source: '',
    policyType: '',
    clientType: '',
    search: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.page > 1) params.append('page', filters.page.toString());
      if (filters.limit !== 20)
        params.append('limit', filters.limit.toString());
      if (filters.source) params.append('source', filters.source);
      if (filters.policyType) params.append('policyType', filters.policyType);
      if (filters.clientType) params.append('clientType', filters.clientType);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/brokers/standardized?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result);

        // If this is the first load (no filters applied), store the full breakdowns
        if (
          !filters.policyType &&
          !filters.clientType &&
          !filters.search &&
          !filters.source
        ) {
          setFullBreakdowns({
            policyTypes: Object.keys(
              result.statistics.policyTypeBreakdown || {},
            ),
            clientTypes: Object.keys(
              result.statistics.clientTypeBreakdown || {},
            ),
          });
        }
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.source,
    filters.policyType,
    filters.clientType,
    filters.search,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilter = useCallback(
    (key: keyof PolicyFilters, value: string | number) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page:
          key !== 'page' ? 1 : typeof value === 'number' ? value : prev.page, // Reset to page 1 when other filters change
      }));
    },
    [],
  );

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //   }).format(amount);
  // };

  // const formatNumber = (num: number) => {
  //   return new Intl.NumberFormat('en-US').format(num);
  // };

  if (loading && !data) {
    return <PolicyDashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchData} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFilter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[200px]">
                <Label htmlFor="search" className="text-sm font-medium">
                  Search
                </Label>
                <div className="relative mt-1">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Policy Number..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                  />
                </div>
              </div>

              <div className="min-w-[140px]">
                <Label htmlFor="source-select" className="text-sm font-medium">
                  Source
                </Label>
                <Select
                  value={filters.source || 'all'}
                  onValueChange={(value) =>
                    updateFilter('source', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger id="source-select" className="mt-1">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="broker1">Broker 1</SelectItem>
                    <SelectItem value="broker2">Broker 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[140px]">
                <Label
                  htmlFor="policy-type-select"
                  className="text-sm font-medium"
                >
                  Policy Type
                </Label>
                <Select
                  value={filters.policyType || 'all'}
                  onValueChange={(value) =>
                    updateFilter('policyType', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger id="policy-type-select" className="mt-1">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {fullBreakdowns.policyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[140px]">
                <Label
                  htmlFor="client-type-select"
                  className="text-sm font-medium"
                >
                  Client Type
                </Label>
                <Select
                  value={filters.clientType || 'all'}
                  onValueChange={(value) =>
                    updateFilter('clientType', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger id="client-type-select" className="mt-1">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {fullBreakdowns.clientTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  onClick={() =>
                    setFilters({
                      page: 1,
                      limit: 20,
                      source: '',
                      policyType: '',
                      clientType: '',
                      search: '',
                    })
                  }
                  variant="outline"
                  size="sm"
                  className="mt-6"
                  disabled={
                    !Object.values(filters).some(
                      (value) => value && value !== 1 && value !== 20,
                    )
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <PolicyStatisticsCards data={data} />

      {/* Detailed Tabs */}
      <div className="px-4 lg:px-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Policies</TabsTrigger>
            <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <PolicyOverview data={data} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <ActivePoliciesView data={data} />
          </TabsContent>

          <TabsContent value="breakdowns" className="space-y-4">
            <PolicyBreakdowns data={data} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <PolicyCharts data={data} />
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <PolicyMetadata data={data} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Policy Table */}
      <div className="px-4 lg:px-6">
        <PolicyTable
          data={data.data}
          pagination={data.pagination}
          onLimitChange={(limit) => updateFilter('limit', limit)}
          currentLimit={filters.limit}
          onPageChange={(page) => updateFilter('page', page)}
          onPolicyClick={(policyNumber) => updateFilter('search', policyNumber)}
          onClearPolicyFilter={() => updateFilter('search', '')}
        />
      </div>
    </div>
  );
}

function PolicyStatisticsCards({ data }: { data: PolicyData }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Policies</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatNumber(data.statistics.totalPolicies)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="h-3 w-3" />
              {data.metadata.activePoliciesPercentage}% Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">Total across all sources</div>
          <div className="text-muted-foreground">
            {formatNumber(data.statistics.activePolicies.totalActivePolicies)}{' '}
            currently active
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total Insured Amount</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data.statistics.totalInsuredAmount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="h-3 w-3" />
              Coverage
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Average: {formatCurrency(data.statistics.averageInsuredAmount)}
          </div>
          <div className="text-muted-foreground">
            Active:{' '}
            {formatCurrency(
              data.statistics.activePolicies.totalActiveInsuredAmount,
            )}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total Premium</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data.statistics.totalPremium)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="h-3 w-3" />
              Revenue
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Average: {formatCurrency(data.statistics.averagePremium)}
          </div>
          <div className="text-muted-foreground">Premium income stream</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Active Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatNumber(data.statistics.activePolicies.totalActiveCustomers)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="h-3 w-3" />
              {data.statistics.activePolicies.averageActivePolicyDuration} days
              avg
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">Unique active customers</div>
          <div className="text-muted-foreground">Average policy duration</div>
        </CardFooter>
      </Card>
    </div>
  );
}

function PolicyOverview({ data }: { data: PolicyData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Source Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Broker 1</span>
              <span className="font-medium">
                {data.statistics.sourceBreakdown.broker1}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Broker 2</span>
              <span className="font-medium">
                {data.statistics.sourceBreakdown.broker2}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Valid Dates</span>
              <span className="font-medium text-green-600">
                {data.metadata.dataQuality.policiesWithValidDates}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Missing Data</span>
              <span className="font-medium text-red-600">
                {data.metadata.dataQuality.policiesWithMissingData}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivePoliciesView({ data }: { data: PolicyData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Policies by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Broker 1</span>
              <span className="font-medium">
                {data.statistics.activePolicies.activePoliciesBySource.broker1}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Broker 2</span>
              <span className="font-medium">
                {data.statistics.activePolicies.activePoliciesBySource.broker2}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Policy Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Active</span>
              <span className="font-medium">
                {data.statistics.activePolicies.totalActivePolicies}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Unique Customers</span>
              <span className="font-medium">
                {data.statistics.activePolicies.totalActiveCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Duration</span>
              <span className="font-medium">
                {data.statistics.activePolicies.averageActivePolicyDuration}{' '}
                days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyBreakdowns({ data }: { data: PolicyData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Policy Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(data.statistics.policyTypeBreakdown).map(
              ([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(data.statistics.clientTypeBreakdown).map(
              ([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyMetadata({ data }: { data: PolicyData }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span className="font-medium">
                {new Date(data.metadata.lastUpdated).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Policies (All Sources)</span>
              <span className="font-medium">
                {data.metadata.totalPoliciesAcrossAllSources}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Policies Percentage</span>
              <span className="font-medium">
                {data.metadata.activePoliciesPercentage}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.metadata.sources.map((source, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="capitalize">{source.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{source.documentCount} docs</span>
                  <Badge variant={source.success ? 'default' : 'destructive'}>
                    {source.success ? 'Success' : 'Error'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
