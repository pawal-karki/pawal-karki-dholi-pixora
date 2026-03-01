"use client";

import React from "react";
import { Role } from "@prisma/client";
import { Bell } from "lucide-react";
import { format } from "date-fns";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/global/mode-toggle";
import { UserButton } from "@/components/global/user-button";

import { cn } from "@/lib/utils";
import { type NotificationsWithUser } from "@/lib/types";

interface InfoBarProps {
  notifications: NotificationsWithUser;
  subAccountId: string;
  role?: Role;
  className?: string;
  user?: {
    name: string;
    email: string;
    avatarUrl: string;
  };
}

const isSubAccountUser = (role?: Role) =>
  role === Role.SUBACCOUNT_USER || role === Role.SUBACCOUNT_GUEST;

const InfoBar: React.FC<InfoBarProps> = ({
  notifications,
  subAccountId,
  className,
  role,
  user,
}) => {
  // Subaccount users always see only their subaccount's notifications.
  // Agency admins/owners start with all notifications but can toggle to current subaccount.
  const subaccountOnly = isSubAccountUser(role)
    ? notifications?.filter((n) => n.subAccountId === subAccountId) ?? []
    : notifications ?? [];

  const [allNotifications, setAllNotifications] =
    React.useState<NotificationsWithUser>(subaccountOnly);
  const [isShowAll, setIsShowAll] = React.useState<boolean>(true);

  const handleSwitch = () => {
    if (!isShowAll) {
      setAllNotifications(notifications ?? []);
    } else {
      setAllNotifications(
        notifications?.filter((n) => n.subAccountId === subAccountId) ?? []
      );
    }
    setIsShowAll((prev) => !prev);
  };

  return (
    <>
      <div
        className={cn(
          "fixed z-[20] md:left-[280px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px] ",
          className
        )}
      >
        <div className="flex items-center gap-2 ml-auto">
          <UserButton user={user} afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full w-8 h-8">
                <Bell aria-label="Notifications" className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="pr-4 flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {isSubAccountUser(role)
                    ? "Activity in your subaccount."
                    : "View all your notifications here."}
                </SheetDescription>
                {/* Toggle only visible to agency admins/owners */}
                {(role === Role.AGENCY_ADMIN ||
                  role === Role.AGENCY_OWNER) && (
                    <Card className="flex items-center justify-between p-4">
                      Current Subaccount
                      <Switch onCheckedChange={handleSwitch} />
                    </Card>
                  )}
              </SheetHeader>
              {!!allNotifications?.length && (
                <div className="flex flex-col gap-4 overflow-y-auto scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium">
                  {allNotifications?.map((notification) => (
                    <Card key={notification.id}>
                      <CardContent className="flex gap-4 p-4">
                        <Avatar>
                          <AvatarImage
                            src={notification.user.avatarUrl}
                            alt="Profile Picture"
                          />
                          <AvatarFallback className="bg-primary">
                            {notification.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                          <p className="leading-tight">
                            <span className="font-semibold">
                              {notification.notification.split("|")[0]}
                            </span>
                            <span className="text-muted-foreground">
                              {notification.notification.split("|")[1]}
                            </span>
                            <span className="font-semibold">
                              {notification.notification.split("|")[2]}
                            </span>
                          </p>
                          <small className="text-sm text-muted-foreground">
                            {format(
                              new Date(notification.createdAt),
                              "dd.MM.yyyy hh:mm a"
                            )}
                          </small>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {!allNotifications?.length && (
                <div className="flex items-center justify-center mb-4 text-sm text-muted-foreground">
                  You have no notifications.
                </div>
              )}
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </>
  );
};

export default InfoBar;
