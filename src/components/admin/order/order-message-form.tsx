"use client";
import { trpc } from "@/app/_trpc/client";
import { caller } from "@/app/_trpc/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/lib/utils";
import { AlertCircle, LoaderCircle, Send, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import OrderTimer from "./order-timer";
import { socket } from "@/lib/socket";
import { Label } from "@/components/ui/label";
import { ORDER_TYPE } from "@/constant/order";

const OrderMessageForm = ({
  initialData,
  sender,
  orderType,
}: {
  initialData: Awaited<
    ReturnType<(typeof caller)["message"]["getOrderMessages"]>
  >;
  sender: "admin" | "user";
  orderType: (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE];
}) => {
  const endOfMessagesRef = useRef<any>(null);

  const [messages, setMessages] = useState<
    {
      sender: string;
      content: string;
      is_image: boolean;
    }[]
  >(initialData ? initialData.order_message : []);

  const [inputMessage, setInputMessage] = useState("");
  const { isSuccess, mutateAsync, isPending } =
    trpc.message.openMesageRequest.useMutation({
      onSuccess: () => toast.success("Success! request has been sent."),
      onError: (err) => toast.error(err.message),
    });
  const saveMessage = trpc.message.sendOrderMessage.useMutation({
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const pushNotif = trpc.notification.pushNotif.useMutation({
    onSuccess: () => {
      socket.emit("new-notif", { user_id: initialData?.user_id });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = ({
    content,
    is_image,
  }: {
    content: string;
    is_image: boolean;
  }) => {
    setMessages((prev) => [...prev, { content, is_image, sender }]);
    socket.emit("message", {
      orderID: initialData?.id,
      sender,
      content,
      is_image,
      user_id: initialData?.user_id,
    });
    if (sender === "admin") {
      if (orderType === "sbtc") {
        pushNotif.mutate({
          user_id: initialData?.user_id as string,
          from: "Admin",
          message: "You have new message from your order.",
          link: `/dashboard/wallet/plans/${!(initialData as any)
            ?.user_investment_plan_id}`,
        });
      }
    }
    saveMessage.mutate({
      content,
      is_image,
      orderType,
      sender,
      orderID: initialData?.id as string,
    });
    setInputMessage("");
  };

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("message");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      className="w-full flex justify-center flex-col h-full"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!inputMessage) return toast.error("Type a message");
        sendMessage({ is_image: false, content: inputMessage });
      }}
    >
      <div className="flex flex-col gap-5 border-b pb-5 relative">
        {orderType === "sbtc" && (
          <OrderTimer
            created_at={initialData?.created_at as Date}
            status={initialData?.status as string}
          />
        )}
        {orderType === "sbtc" && (
          <div className="flex items-center w-full text-muted-foreground">
            <div className="flex flex-col gap-2 w-full">
              <small className="text-foreground font-bold">
                PRICE: {(initialData as any)?.user_investment_plan.total_price}
              </small>
              <small className="text-foreground font-bold">
                SBTC: {initialData?.amount}
              </small>
            </div>
            <div className="flex flex-col gap-2 w-full items-end">
              <small>METHOD: {initialData?.method}</small>
              <small>
                CURRENCY:{" "}
                {(initialData as any).user_investment_plan.package.currency}
              </small>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5 w-auto max-h-[450px] min-h-[350px] overflow-y-auto py-10 px-3">
        {messages.length === 0 && (
          <div className="w-full h-full grid place-items-center">
            <Label className="text-lg text-center font-normal text-muted-foreground">
              It’s quiet here. Send the first message to get things started!
            </Label>
          </div>
        )}
        {messages.map((message, i) => {
          if (sender === "admin") {
            if (message.sender === "admin") {
              return (
                <div
                  key={i}
                  className="bg-primary rounded-md px-4 py-3 self-end"
                >
                  {message.is_image ? (
                    <Link href={message.content} target="_blank">
                      <Image
                        src={message.content}
                        alt="Message Image"
                        width={400}
                        height={400}
                        className="w-full h-auto"
                      />
                    </Link>
                  ) : (
                    message.content
                  )}
                </div>
              );
            } else {
              return (
                <div key={i} className="flex self-start items-center gap-2">
                  <div key={i} className="bg-muted rounded-md px-4 py-3">
                    {message.is_image ? (
                      <Link href={message.content} target="_blank">
                        <Image
                          src={message.content}
                          alt="Message Image"
                          width={400}
                          height={400}
                          className="w-full h-auto"
                        />
                      </Link>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              );
            }
          } else {
            if (message.sender === "user") {
              return (
                <div
                  key={i}
                  className="bg-primary rounded-md px-4 py-3 self-end"
                >
                  {message.is_image ? (
                    <Link href={message.content} target="_blank">
                      <Image
                        src={message.content}
                        alt="Message Image"
                        width={400}
                        height={400}
                        className="w-full h-auto"
                      />
                    </Link>
                  ) : (
                    message.content
                  )}
                </div>
              );
            } else {
              return (
                <div key={i} className="flex self-start items-start gap-2">
                  <Image
                    src={"/icons/logo/logo.svg"}
                    alt="Stylus Logo"
                    width={30}
                    height={30}
                    className="rounded-full pt-1"
                  />
                  <div key={i} className="bg-muted rounded-md px-4 py-3">
                    {message.is_image ? (
                      <Link href={message.content} target="_blank">
                        <Image
                          src={message.content}
                          alt="Message Image"
                          width={400}
                          height={400}
                          className="w-full h-auto"
                        />
                      </Link>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              );
            }
          }
        })}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="w-full flex flex-col items-center">
        {initialData?.request_chat && sender === "user" ? (
          <Button type="button" variant={"secondary"}>
            Request has been sent.
          </Button>
        ) : (
          initialData?.closed &&
          sender === "user" && (
            <Button
              type="button"
              className="self-center"
              disabled={isSuccess || isPending}
              variant={isSuccess ? "secondary" : "default"}
              onClick={async () =>
                mutateAsync({ orderID: initialData.id, orderType })
              }
            >
              {isPending ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                "Request to open."
              )}
            </Button>
          )
        )}
        {initialData?.request_chat && sender === "admin" ? (
          <div className="pb-10 flex flex-col sm:flex-row text-center text-lg items-center gap-3">
            <Button type="button" className="h-9 px-2">
              <AlertCircle size={20} />
            </Button>
            User requested to open this conversation.
          </div>
        ) : !initialData?.closed ? (
          <div className="flex items-center gap-2  w-full">
            <UploadButton
              endpoint="orderReceiptUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  sendMessage({ content: res[0].url, is_image: true });
                }
              }}
              content={{
                button({ ready }) {
                  if (ready)
                    return (
                      <div className="w-12 bg-primary h-full flex items-center justify-center">
                        <UploadCloud size={18} />
                      </div>
                    );

                  return (
                    <Button variant={"secondary"} type="button">
                      <LoaderCircle size={18} className="animate-spin" />
                    </Button>
                  );
                },
              }}
              onUploadError={(error: Error) => {
                // Do something with the error.
                toast.error(`ERROR! ${error.message}`);
              }}
              appearance={{
                button: "bg-muted text-foreground w-auto",
                allowedContent: "hidden",
              }}
            />
            <Input
              placeholder="Type Message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <Button>
              <Send size={18} />
            </Button>
          </div>
        ) : (
          <small className="text-center w-full pt-2 text-muted-foreground">
            Conversation is closed.
          </small>
        )}
      </div>
    </form>
  );
};

export default OrderMessageForm;
