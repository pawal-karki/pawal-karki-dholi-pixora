"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown, Zap } from "lucide-react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  currentPlan: string;
  agencyId: string;
  feature?: "subaccounts" | "team" | "general";
}

const featureMessages = {
  subaccounts: {
    icon: Zap,
    benefits: [
      "Create unlimited sub-accounts (Agency plan)",
      "Up to 5 sub-accounts (Pro plan)",
      "Better client organization",
    ],
  },
  team: {
    icon: Crown,
    benefits: [
      "Unlimited team members (Agency plan)",
      "Up to 5 team members (Pro plan)",
      "Better collaboration",
    ],
  },
  general: {
    icon: Crown,
    benefits: [
      "More sub-accounts",
      "More team members",
      "Advanced features",
    ],
  },
};

export function UpgradeDialog({
  open,
  onOpenChange,
  title = "Upgrade Required",
  description,
  currentPlan,
  agencyId,
  feature = "general",
}: UpgradeDialogProps) {
  const router = useRouter();
  const featureInfo = featureMessages[feature];
  const Icon = featureInfo.icon;

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push(`/agency/${agencyId}/billing`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 rounded-lg bg-muted p-4">
          <p className="mb-2 text-sm font-medium">
            Current Plan: <span className="text-primary">{currentPlan}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Upgrade to unlock:
          </p>
          <ul className="space-y-2">
            {featureInfo.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="text-emerald-500">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade} className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
