"use client";

import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  ExternalLink,
  Receipt,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  created: Date;
  type: "charge" | "refund" | "payout" | "subscription";
  customerEmail?: string;
  invoicePdf?: string | null;
  hostedUrl?: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
  emptyMessage?: string;
}

const statusColors: Record<string, string> = {
  succeeded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const typeIcons: Record<string, React.ReactNode> = {
  charge: <ArrowDownRight className="h-4 w-4 text-emerald-500" />,
  subscription: <CreditCard className="h-4 w-4 text-blue-500" />,
  refund: <ArrowUpRight className="h-4 w-4 text-red-500" />,
  payout: <ArrowUpRight className="h-4 w-4 text-purple-500" />,
};

export function TransactionHistory({
  transactions,
  title = "Transaction History",
  emptyMessage = "No transactions yet",
}: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
        <Receipt className="h-12 w-12 mb-4 opacity-20" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <div className="flex items-center justify-center">
                  {typeIcons[transaction.type] || <CreditCard className="h-4 w-4" />}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {transaction.description || "Payment"}
                  </span>
                  {transaction.customerEmail && (
                    <span className="text-xs text-muted-foreground">
                      {transaction.customerEmail}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(transaction.created), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[transaction.status] || ""}
                >
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                <span
                  className={
                    transaction.type === "refund"
                      ? "text-red-500"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                >
                  {transaction.type === "refund" ? "-" : "+"}
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                {(transaction.invoicePdf || transaction.hostedUrl) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a
                      href={transaction.hostedUrl || transaction.invoicePdf || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
