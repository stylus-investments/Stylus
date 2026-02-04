"use client";
import { trpc } from "@/app/_trpc/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { socket } from "@/lib/socket";
import { ProfileStatus } from "@prisma/client";
import { Ban, CircleCheckBig, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export const UpdateUserStatus = ({
  user_id,
  status,
  emergency_contact_id,
}: {
  user_id: string;
  status: ProfileStatus;
  emergency_contact_id?: number;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const { mutateAsync, isPending } = trpc.user.updateUserStatus.useMutation({
    onSuccess: () => {
      socket.emit("new-notif", { user_id });
      toast.success(`Success! this user is ${status.toLocaleLowerCase()}.`);
      router.refresh();
      setOpen(false);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {status === "VERIFIED" ? (
          <Button className="w-full bg-green-600 hover:bg-green-500">
            <CircleCheckBig size={18} className="mr-1" />
            Verify
          </Button>
        ) : (
          <Button variant={"destructive"} className="w-full">
            <Ban size={18} className="mr-1" />
            Invalid
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {status === "VERIFIED" ? "Verify" : "Invalid"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you user to {status === "VERIFIED" ? "verify" : "invalid"}{" "}
            this{" "}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {status === ProfileStatus["INVALID"] && (
          <div className="flex flex-col gap-2 pt-4">
            <Label>Reason for invalidation:</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
            />
            <small className="text-muted-foreground">
              Please provide a brief reason for the invalidation.
            </small>
          </div>
        )}
        <AlertDialogFooter className="flex flex-row items-center gap-5 w-full">
          <Button
            className="w-full"
            disabled={isPending}
            onClick={async () => {
              if (status === ProfileStatus.INVALID && !message)
                return toast.error(
                  "You must provide a reason why this user is not valid.",
                );
              await mutateAsync({
                user_id,
                status,
                message: status === ProfileStatus.INVALID ? message : "",
                emergency_contact_id,
              });
            }}
            variant={status === "VERIFIED" ? "default" : "destructive"}
          >
            {isPending ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              "Yes I'm Sure"
            )}
          </Button>
          <Button
            variant={"secondary"}
            className="w-full"
            onClick={() => setOpen(false)}
          >
            No Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
