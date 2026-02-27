"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  users: UserItem[];
  onSelectUser: (userId: string, userName: string) => void;
}

export function UserPickerDialog({ open, onClose, users, onSelectUser }: Props) {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (role: string) => {
    switch (role) {
      case "AGENCY_OWNER":
        return "Owner";
      case "AGENCY_ADMIN":
        return "Admin";
      case "SUBACCOUNT_USER":
        return "User";
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>Select a team member to chat with</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* User list */}
        <ScrollArea className="max-h-[320px]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user.id, user.name);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">
                    {roleLabel(user.role)}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
