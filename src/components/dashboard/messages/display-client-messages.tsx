"use client";
import OrderMessageForm from "@/components/admin/order/order-message-form";
import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ORDER_TYPE } from "@/constant/order";

const DisplayClientMessages = ({
  orderID,
  unseen,
  orderType,
}: {
  orderID: string;
  unseen: number;
  orderType: (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE];
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: order, refetch } = trpc.message.getOrderMessages.useQuery(
    { orderID, sender: "user", orderType },
    {
      enabled: open,
      refetchOnMount: false,
    }
  );

  const seenMessage = trpc.message.updateUnreadMessage.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  useEffect(() => {
    if (open) {
      // Join the order room when the component mounts
      socket.emit("joinOrder", { orderID });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      socket.on("update", async (data) => {
        await refetch();
        if (data === "closed") {
          return toast("Admin closed the conversation.");
        }
        if (data === "completed") {
          return toast.success("Success! this order has been completed.");
        }
        toast.error("Admin marked this order as invalid.");
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderID, open]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="relative w-32">
          <Button className="h-7 w-full">Chat</Button>
          {unseen ? (
            <div className=" absolute bg-destructive text-white px-2 py-1 shadow-2xl text-xs rounded-br-full rounded-t-full -right-4 -top-4">
              {unseen}
            </div>
          ) : null}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full flex flex-col gap-5">
        {order ? (
          <OrderMessageForm
            orderType={orderType}
            initialData={order as any}
            sender="user"
          />
        ) : (
          <div className="w-full h-[500px] grid place-items-center">
            <LoaderCircle size={40} className="animate-spin text-primary" />
          </div>
        )}
        <Button
          variant={"secondary"}
          className="w-full"
          onClick={async () => {
            setOpen(false);
            seenMessage.mutateAsync({ sender: "user", orderID, orderType });
          }}
        >
          Close
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisplayClientMessages;
