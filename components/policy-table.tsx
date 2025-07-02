'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

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

interface PolicyTableProps {
  data?: StandardizedPolicy[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: {
    page?: number;
    limit?: number;
    source?: string;
    policyType?: string;
    clientType?: string;
    search?: string;
  };
  onLimitChange?: (limit: number) => void;
  currentLimit?: number;
  onPageChange?: (page: number) => void;
}

export function PolicyTable({
  data: propData,
  pagination: propPagination,
  filters = {},
  onLimitChange,
  currentLimit = 20,
  onPageChange,
}: PolicyTableProps) {
  const [data, setData] = useState<StandardizedPolicy[]>(propData || []);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (propData) return; // Don't fetch if data is provided via props

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.page && filters.page > 1)
        params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
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
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [
    propData,
    filters.page,
    filters.limit,
    filters.source,
    filters.policyType,
    filters.clientType,
    filters.search,
  ]);

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [propData, fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.toLowerCase() === 'not known') return 'N/A';
    return dateString;
  };

  const isActive = (policy: StandardizedPolicy) => {
    if (!policy.startDate || !policy.renewalDate) return false;

    const currentDate = new Date();
    const startDate = parseDate(policy.startDate);
    const renewalDate = parseDate(policy.renewalDate);

    if (!startDate || !renewalDate) return false;

    return startDate <= currentDate && renewalDate > currentDate;
  };

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

  const columns: ColumnDef<StandardizedPolicy>[] = [
    {
      accessorKey: 'policyNumber',
      header: 'Policy Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('policyNumber')}</div>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => {
        const source = row.getValue('source') as string;
        return (
          <Badge variant="outline">
            {source === 'broker1' ? 'Broker 1' : 'Broker 2'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'insurer',
      header: 'Insurer',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('insurer') || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'policyType',
      header: 'Policy Type',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue('policyType') || 'N/A'}</Badge>
      ),
    },
    {
      accessorKey: 'clientType',
      header: 'Client Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('clientType') || 'N/A'}</Badge>
      ),
    },
    {
      accessorKey: 'insuredAmount',
      header: ({ column }) => <div className="text-right">Insured Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('insuredAmount'));
        return (
          <div className="text-right font-medium">{formatCurrency(amount)}</div>
        );
      },
    },
    {
      accessorKey: 'premium',
      header: ({ column }) => <div className="text-right">Premium</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('premium'));
        return (
          <div className="text-right font-medium">{formatCurrency(amount)}</div>
        );
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => <div>{formatDate(row.getValue('startDate'))}</div>,
    },
    {
      accessorKey: 'renewalDate',
      header: 'Renewal Date',
      cell: ({ row }) => <div>{formatDate(row.getValue('renewalDate'))}</div>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const active = isActive(row.original);
        return (
          <Badge variant={active ? 'default' : 'secondary'}>
            {active ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'clientRef',
      header: 'Client Ref',
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('clientRef') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'businessDescription',
      header: 'Business Description',
      cell: ({ row }) => {
        const description = row.getValue('businessDescription') as string;
        return (
          <div className="max-w-[200px] truncate" title={description}>
            {description || 'N/A'}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        <Button onClick={fetchData} variant="outline">
          Retry
        </Button>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Policy Data ({data.length} policies)</CardTitle>
            <CardDescription>
              Detailed view of all policies matching your filters
            </CardDescription>
          </div>
          {onLimitChange && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="table-limit" className="text-sm">
                Rows per page:
              </Label>
              <Select
                value={currentLimit.toString()}
                onValueChange={(value) => onLimitChange(parseInt(value))}
              >
                <SelectTrigger id="table-limit" className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <PolicyDataTable
          columns={columns}
          data={data}
          pagination={propPagination}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}

function PolicyDataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPageChange,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter policy numbers..."
          value={
            (table.getColumn('policyNumber')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('policyNumber')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {pagination ? (
            <>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount,
              )}{' '}
              of {pagination.totalCount} results
            </>
          ) : (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          )}
        </div>
        {pagination && onPageChange && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={!pagination.hasPrevPage}
            >
              <IconChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
