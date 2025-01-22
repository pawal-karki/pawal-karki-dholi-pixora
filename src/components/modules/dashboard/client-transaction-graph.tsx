"use client";

import { useMemo } from "react";
import { eachDayOfInterval, format, startOfDay, subMonths } from "date-fns";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  created: Date;
  type: "charge" | "refund" | "payout" | "subscription";
  subAccountId?: string;
}

interface ClientTransactionGraphProps {
  transactions: Transaction[];
  potentialIncome?: number;
  startDate?: Date;
  endDate?: Date;
  currency?: string;
}

interface ChartDataPoint {
  date: string;
  income: number;
  pipeline: number;
}

export function ClientTransactionGraph({
  transactions,
  potentialIncome = 0,
  startDate,
  endDate,
  currency = "NPR",
}: ClientTransactionGraphProps) {
  const chartData = useMemo(() => {
    // Default to last 3 months if no dates provided
    const end = endDate || new Date();
    const start = startDate || subMonths(end, 3);

    // Daily buckets (matches the reference chart density)
    const days = eachDayOfInterval({ start, end });

    // Initialize data points for each day
    const dataMap = new Map<string, { income: number }>();
    days.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      dataMap.set(dayKey, { income: 0 });
    });

    // Income series: successful Stripe client payments (charges + subscriptions), refunds subtract
    transactions
      .filter((t) => {
        const txDate = new Date(t.created);
        return txDate >= start && txDate <= end && t.status === "succeeded";
      })
      .forEach((transaction) => {
        const txDate = new Date(transaction.created);
        const day = startOfDay(txDate);
        const dayKey = format(day, "yyyy-MM-dd");

        const current = dataMap.get(dayKey) || { income: 0 };

        if (transaction.type === "charge" || transaction.type === "subscription") {
          current.income += transaction.amount;
        } else if (transaction.type === "refund") {
          current.income = Math.max(0, current.income - transaction.amount);
        }

        dataMap.set(dayKey, current);
      });

    // Pipeline series: current potential income (static for now) spread across days
    // This creates the “second area” like the screenshot, independent from income.
    const pipelinePerDay =
      days.length > 0 ? Math.round((potentialIncome / days.length) * 100) / 100 : 0;

    return days.map((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      const values = dataMap.get(dayKey) || { income: 0 };
      return {
        date: format(day, "MMM d"),
        income: Math.round(values.income * 100) / 100,
        pipeline: pipelinePerDay,
      };
    });
  }, [transactions, potentialIncome, startDate, endDate]);

  const chartConfig = {
    income: {
      label: "Stripe (Income)",
      color: "#6b7280", // gray-500
    },
    pipeline: {
      label: "Pipeline (Potential)",
      color: "#9ca3af", // gray-400
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <p className="text-sm">No transaction data available for this period</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6b7280" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorStacked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.1}
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
          interval={6}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return value.toString();
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const numValue = typeof value === "number" ? value : 0;
                return [
                  `${currency} ${numValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  name === "income" ? "Stripe" : "Pipeline",
                ];
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="pipeline"
          stroke="#111827"
          strokeWidth={1.5}
          fillOpacity={1}
          fill="url(#colorStacked)"
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#111827"
          strokeWidth={1.5}
          fillOpacity={1}
          fill="url(#colorBase)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
