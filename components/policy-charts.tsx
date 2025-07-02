'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface PolicyData {
  statistics: {
    totalPolicies: number;
    totalInsuredAmount: number;
    totalPremium: number;
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
      activePoliciesBySource: {
        broker1: number;
        broker2: number;
      };
    };
  };
}

interface PolicyChartsProps {
  data?: PolicyData;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export function PolicyCharts({ data: propData }: PolicyChartsProps) {
  const [data, setData] = useState<PolicyData | null>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [chartType, setChartType] = useState<
    'policy-types' | 'client-types' | 'sources' | 'active-vs-total'
  >('policy-types');

  const fetchData = useCallback(async () => {
    if (propData) return; // Don't fetch if data is provided via props

    try {
      const response = await fetch('/api/brokers/standardized?limit=1'); // Just need statistics
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [propData]);

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [propData, fetchData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Policy Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const policyTypeData = Object.entries(
    data.statistics.policyTypeBreakdown,
  ).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const clientTypeData = Object.entries(
    data.statistics.clientTypeBreakdown,
  ).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const sourceData = [
    {
      name: 'Broker 1',
      total: data.statistics.sourceBreakdown.broker1,
      active: data.statistics.activePolicies.activePoliciesBySource.broker1,
    },
    {
      name: 'Broker 2',
      total: data.statistics.sourceBreakdown.broker2,
      active: data.statistics.activePolicies.activePoliciesBySource.broker2,
    },
  ];

  const activeVsTotalData = [
    {
      name: 'Active Policies',
      value: data.statistics.activePolicies.totalActivePolicies,
    },
    {
      name: 'Inactive Policies',
      value:
        data.statistics.totalPolicies -
        data.statistics.activePolicies.totalActivePolicies,
    },
  ];

  const chartConfig: ChartConfig = {
    value: {
      label: 'Count',
      color: 'hsl(var(--chart-1))',
    },
    total: {
      label: 'Total Policies',
      color: 'hsl(var(--chart-1))',
    },
    active: {
      label: 'Active Policies',
      color: 'hsl(var(--chart-2))',
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'policy-types':
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={policyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {policyTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'client-types':
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'sources':
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--chart-1))"
                  name="Total Policies"
                />
                <Bar
                  dataKey="active"
                  fill="hsl(var(--chart-2))"
                  name="Active Policies"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'active-vs-total':
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeVsTotalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activeVsTotalData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'policy-types':
        return 'Policies by Type';
      case 'client-types':
        return 'Policies by Client Type';
      case 'sources':
        return 'Policies by Source (Total vs Active)';
      case 'active-vs-total':
        return 'Active vs Inactive Policies';
      default:
        return 'Policy Analytics';
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case 'policy-types':
        return 'Distribution of policies across different policy types';
      case 'client-types':
        return 'Breakdown of policies by client category';
      case 'sources':
        return 'Comparison of total and active policies by broker source';
      case 'active-vs-total':
        return 'Ratio of active to inactive policies';
      default:
        return 'Visual analytics for policy data';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getChartTitle()}</CardTitle>
            <CardDescription>{getChartDescription()}</CardDescription>
          </div>
          <Select
            value={chartType}
            onValueChange={(value: any) => setChartType(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="policy-types">Policy Types</SelectItem>
              <SelectItem value="client-types">Client Types</SelectItem>
              <SelectItem value="sources">Sources Comparison</SelectItem>
              <SelectItem value="active-vs-total">Active vs Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
