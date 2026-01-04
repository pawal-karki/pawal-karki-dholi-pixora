import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

const SubAccountUnauthorizedPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-4xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground max-w-md">
          You do not have permission to access this subaccount. Please contact your
          agency administrator to get access.
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/agency">
            <Button variant="outline">Go to Agency</Button>
          </Link>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubAccountUnauthorizedPage;

