"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { user_info } from "@prisma/client";
import { Ellipsis, User } from "lucide-react";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const UserTableOperation = ({ user }: { user: user_info }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button className="w-12 p-0 h-7">
          <Ellipsis size={25} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Operations</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link
          href={`/admin/user/${user.user_id}`}
          className="flex w-full items-center justify-between px-2 py-2 hover:bg-muted rounded-md"
        >
          <Label>Profile</Label>
          <DropdownMenuShortcut>
            <User size={18} />
          </DropdownMenuShortcut>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserTableOperation;
