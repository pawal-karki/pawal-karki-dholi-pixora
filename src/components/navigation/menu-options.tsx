"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  type User,
  type AgencySidebarOption,
  type SubAccount,
  type SubAccountSidebarOption,
  type Agency,
  type Permissions,
  Role,
} from "@prisma/client";
import { ChevronsUpDown, Compass, Menu, PlusCircle } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import CustomModal from "@/components/global/custom-modal";
import SubAccountDetails from "@/components/forms/subaccount-details";

import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal";
import { icons } from "@/components/icons";
import { Search } from "lucide-react";

interface MenuOptionsProps {
  id: string;
  sideBarLogo: string;
  subAccount: SubAccount[];
  sideBarOptions: AgencySidebarOption[] | SubAccountSidebarOption[];
  details: Agency | SubAccount;
  user: {
    agency: Agency | null;
    Permissions: Permissions[];
  } & Omit<User, "password">;
}

// Memoize the navigation link component to prevent unnecessary re-renders
const NavigationLink = React.memo<{
  option: AgencySidebarOption | SubAccountSidebarOption;
  isActive: boolean;
}>(({ option, isActive }) => {
  const IconComponent = React.useMemo(
    () => icons.find((icon) => icon.value === option.icon),
    [option.icon]
  );

  return (
    <Link
      href={option.link}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {IconComponent && (
        <span
          className={cn(
            "h-4 w-4 flex-shrink-0 flex items-center justify-center transition-colors [&>svg]:w-full [&>svg]:h-full",
            isActive ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <IconComponent.path />
        </span>
      )}
      <span className="truncate leading-none">{option.name}</span>
    </Link>
  );
});
NavigationLink.displayName = "NavigationLink";

// Memoize the account switcher item
const AccountSwitcherItem = React.memo<{
  sub: SubAccount;
  defaultOpen: boolean;
}>(({ sub, defaultOpen }) => {
  const content = (
    <div className="flex gap-3 w-full items-center">
      <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={sub.subAccountLogo}
          alt="Sub Account Logo"
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{sub.name}</span>
        <span className="text-xs text-muted-foreground truncate">
          {sub.address}
        </span>
      </div>
    </div>
  );

  if (defaultOpen) {
    return <Link href={`/subaccount/${sub.id}`}>{content}</Link>;
  }

  return (
    <SheetClose asChild>
      <Link href={`/subaccount/${sub.id}`}>{content}</Link>
    </SheetClose>
  );
});
AccountSwitcherItem.displayName = "AccountSwitcherItem";

const MenuOptions: React.FC<MenuOptionsProps> = ({
  details,
  id,
  sideBarLogo,
  sideBarOptions = [],
  subAccount = [],
  user,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { setOpen } = useModal();
  const pathname = usePathname();

  // Check if mobile on mount and window resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Memoize expensive computations
  const isOwnerOrAdmin = React.useMemo(
    () => user.role === Role.AGENCY_ADMIN || user.role === Role.AGENCY_OWNER,
    [user.role]
  );

  // Memoize active pathname check for each option
  // Check if pathname matches exactly or starts with the link (for nested routes like pipelines)
  const getIsActive = React.useCallback(
    (link: string) => {
      // Exact match
      if (pathname === link) return true;

      // For nested routes, only match if the link is not a base path
      // Base paths like /subaccount/123 should only match exactly
      // Routes like /subaccount/123/pipelines can match nested routes
      const isBasePath = link.match(/^\/subaccount\/[^/]+$/); // Matches /subaccount/123 but not /subaccount/123/pipelines
      const isAgencyBasePath = link.match(/^\/agency\/[^/]+$/); // Matches /agency/123 but not /agency/123/settings

      // If it's a base path, don't allow nested matching
      if (isBasePath || isAgencyBasePath) {
        return false;
      }

      // Check if pathname starts with link followed by '/' (for nested routes)
      // This handles cases like /subaccount/123/pipelines matching /subaccount/123/pipelines/456
      if (pathname.startsWith(link + "/")) return true;
      return false;
    },
    [pathname]
  );

  // Determine if sidebar should be open by default (desktop) or controlled (mobile)
  const defaultOpen = !isMobile;

  return (
    <>
      {/* Mobile trigger button */}
      <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          asChild
          className="absolute left-4 top-4 z-[100] md:hidden flex"
        >
          <Button size="icon" variant="outline" className="rounded-full">
            <Menu aria-label="Open Menu" className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col md:hidden z-[100] w-[320px] max-w-[85vw] p-0 bg-background/98 backdrop-blur-xl fixed top-0 border-r border-border/40 shadow-lg"
        >
          <SheetTitle className="sr-only">Sidebar</SheetTitle>
          <SidebarContent
            details={details}
            id={id}
            sideBarLogo={sideBarLogo}
            sideBarOptions={sideBarOptions}
            subAccount={subAccount}
            user={user}
            isOwnerOrAdmin={isOwnerOrAdmin}
            getIsActive={getIsActive}
            setOpen={setOpen}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar - always visible */}
      <div className="hidden md:flex md:flex-col z-[20] w-[280px] p-0 fixed left-0 top-0 h-screen bg-background/98 backdrop-blur-xl border-r border-border/40 shadow-sm">
        <SidebarContent
          details={details}
          id={id}
          sideBarLogo={sideBarLogo}
          sideBarOptions={sideBarOptions}
          subAccount={subAccount}
          user={user}
          isOwnerOrAdmin={isOwnerOrAdmin}
          getIsActive={getIsActive}
          setOpen={setOpen}
          isMobile={false}
        />
      </div>
    </>
  );
};

// Extract sidebar content to avoid duplication
const SidebarContent = React.memo<{
  details: Agency | SubAccount;
  id: string;
  sideBarLogo: string;
  sideBarOptions?: AgencySidebarOption[] | SubAccountSidebarOption[] | null;
  subAccount?: SubAccount[] | null;
  user: {
    agency: Agency | null;
    Permissions?: Permissions[] | null;
  } & Omit<User, "password">;
  isOwnerOrAdmin: boolean;
  getIsActive: (link: string) => boolean;
  setOpen: (modal: React.ReactNode) => void;
  isMobile: boolean;
}>(
  ({
    details,
    id,
    sideBarLogo,
    sideBarOptions,
    subAccount,
    user,
    isOwnerOrAdmin,
    getIsActive,
    setOpen,
    isMobile,
  }) => {
    const defaultOpen = !isMobile;
    const [searchQuery, setSearchQuery] = React.useState("");

    // Ensure sideBarOptions is always an array with defensive checks
    // Stable reference to prevent infinite re-renders
    const safeSideBarOptions = React.useMemo(() => {
      if (!sideBarOptions) return [];
      if (!Array.isArray(sideBarOptions)) return [];
      return sideBarOptions.filter((opt) => opt != null);
    }, [sideBarOptions]);

    // Ensure subAccount is always an array
    // Stable reference to prevent infinite re-renders
    const safeSubAccount = React.useMemo(() => {
      if (!subAccount) return [];
      if (!Array.isArray(subAccount)) return [];
      return subAccount.filter((sub) => sub != null);
    }, [subAccount]);

    // Filter navigation options based on search query
    const filteredOptions = React.useMemo(() => {
      if (
        !Array.isArray(safeSideBarOptions) ||
        safeSideBarOptions.length === 0
      ) {
        return [];
      }
      if (!searchQuery.trim()) return safeSideBarOptions;
      const query = searchQuery.toLowerCase();
      return safeSideBarOptions.filter((option) => {
        if (!option || !option.name) return false;
        return option.name.toLowerCase().includes(query);
      });
    }, [safeSideBarOptions, searchQuery]);

    return (
      <>
        {/* Logo Section */}
        <div className="px-5 pt-5 pb-4">
          <div className="h-10 relative">
            <Image
              src={sideBarLogo}
              alt="Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        {/* Agency/Account Switcher */}
        <div className="px-4 pb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full flex items-center justify-between h-auto py-2.5 px-3 bg-muted/40 hover:bg-muted/60 border-0 rounded-lg transition-colors"
                variant="ghost"
              >
                <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <Compass className="h-3.5 w-3.5 text-primary" aria-hidden />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-sm truncate text-foreground">
                      {details.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {details.address}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-1.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-1.5 mt-1.5 z-[200] rounded-lg shadow-lg border">
              <Command className="rounded-md">
                <CommandInput
                  placeholder="Search accounts..."
                  className="h-8 text-sm"
                />
                <CommandList className="max-h-[280px]">
                  <CommandEmpty>No accounts found.</CommandEmpty>
                  {isOwnerOrAdmin && user.agency && (
                    <CommandGroup heading="Agency">
                      <CommandItem
                        className="rounded-md p-2 cursor-pointer"
                        asChild
                      >
                        {defaultOpen ? (
                          <Link
                            href={`/agency/${user.agency.id}`}
                            className="flex gap-3 w-full items-center"
                          >
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={user.agency.agencyLogo}
                                alt="Agency Logo"
                                fill
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">
                                {user.agency.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {user.agency.address}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/agency/${user.agency.id}`}
                              className="flex gap-3 w-full items-center"
                            >
                              <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={user.agency.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">
                                  {user.agency.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {user.agency.address}
                                </span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}
                  {safeSubAccount.length > 0 && (
                    <CommandGroup heading="Sub Accounts">
                      {safeSubAccount.map((sub) => (
                        <CommandItem
                          key={sub.id}
                          className="rounded-md p-2 cursor-pointer"
                          asChild
                        >
                          <AccountSwitcherItem
                            sub={sub}
                            defaultOpen={defaultOpen}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
                {isOwnerOrAdmin && (
                  <div className="p-2 pt-0">
                    {defaultOpen ? (
                      <Button
                        onClick={() =>
                          setOpen(
                            <CustomModal
                              title="Create A Subaccount"
                              subTitle="You can switch between your agency account and the subaccount from the sidebar"
                            >
                              <SubAccountDetails
                                agencyDetails={user.agency!}
                                userId={user.id}
                                userName={user.name}
                              />
                            </CustomModal>
                          )
                        }
                        className="w-full rounded-md"
                        variant="outline"
                        size="sm"
                      >
                        <PlusCircle aria-hidden className="w-3.5 h-3.5 mr-2" />
                        Create Sub Account
                      </Button>
                    ) : (
                      <SheetClose asChild>
                        <Button
                          onClick={() =>
                            setOpen(
                              <CustomModal
                                title="Create A Subaccount"
                                subTitle="You can switch between your agency account and the subaccount from the sidebar"
                              >
                                <SubAccountDetails
                                  agencyDetails={user.agency!}
                                  userId={user.id}
                                  userName={user.name}
                                />
                              </CustomModal>
                            )
                          }
                          className="w-full rounded-md"
                          variant="outline"
                          size="sm"
                        >
                          <PlusCircle
                            aria-hidden
                            className="w-3.5 h-3.5 mr-2"
                          />
                          Create Sub Account
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Navigation Links */}
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4">
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
                Navigation
              </p>
              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-2.5 text-sm bg-background border-muted/50 focus:border-muted"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions
                  .filter((option) => option && option.id && option.link)
                  .map((option) => (
                    <NavigationLink
                      key={option.id}
                      option={option}
                      isActive={getIsActive(option.link)}
                    />
                  ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate text-foreground">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }
);
SidebarContent.displayName = "SidebarContent";

export default MenuOptions;
