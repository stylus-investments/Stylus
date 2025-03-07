"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import DisplayAdminMessages from "./display-admin-message";
import { socket } from "@/lib/socket";
import { ORDER_TYPE, ORDERSTATUS } from "@/constant/order";
import FilterOrderTable from "./filter-order-table";
import { caller } from "@/app/_trpc/server";
import TableServerPagination from "@/components/dashboard/table-server-pagination";

const SPHPOrderTable = ({
  orders,
  filter,
}: {
  orders: Awaited<ReturnType<(typeof caller)['token']['qAllSPHPOrder']>>;
  filter: {
    status: string;
    request_chat: string;
  };
}) => {
  const returnStatusButton = (status: string) => {
    switch (status) {
      case ORDERSTATUS["processing"]:
        return <Button className="h-7">Processing</Button>;
      case ORDERSTATUS["unpaid"]:
        return (
          <Button className="h-7" variant={"destructive"}>
            Unpaid
          </Button>
        );
      case ORDERSTATUS["upcoming"]:
        return <Button className="h-7 bg-blue-500">Upcoming</Button>;
      case ORDERSTATUS["paid"]:
        return <Button className="h-7 bg-green-500">Paid</Button>;
      case ORDERSTATUS["invalid"]:
        return (
          <Button className="h-7" variant={"destructive"}>
            Invalid
          </Button>
        );
    }
    return status;
  };

  const [ordersData, setOrdersData] = useState(orders.data);

  useEffect(() => {
    socket.connect();
    socket.on("newOrder", (data) => {
      setOrdersData((prev) => [...prev!, data]);
    });
    socket.on("admin_unseen_messages", (data) => {
      const orderID = data;
      setOrdersData((prev) =>
        prev.map((order) =>
          order.id === orderID
            ? {
                ...order,
                admin_unread_messages: order.admin_unread_messages + 1,
              }
            : order
        )
      );
    });

    return () => {
      socket.off("newOrder");
      socket.off("admin_unseen_messages");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setOrdersData(orders.data);
  }, [orders.data]);

  return (
    <div className="padding py-24 flex flex-col gap-10">
      <FilterOrderTable filter={filter} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Amount (sPHP)</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersData &&
            ordersData.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{returnStatusButton(order.status)}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  {order.status === ORDERSTATUS["processing"] ||
                  order.status === ORDERSTATUS["invalid"] ||
                  order.status === ORDERSTATUS["paid"] ? (
                    <DisplayAdminMessages
                      orderType='sphp'
                      orderID={order.id}
                      unseen={order.admin_unread_messages}
                    />
                  ) : (
                    order.status
                  )}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="h-7" variant={"secondary"}>
                        View
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-full max-h-[600px] overflow-y-auto">
                      {order.receipt ? (
                        <Image
                          src={order.receipt}
                          alt="Order Receipt"
                          width={200}
                          height={50}
                          className="w-full h-auto"
                        />
                      ) : (
                        "No Receipt"
                      )}
                      <AlertDialogFooter>
                        <AlertDialogCancel className="w-full">
                          Close
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
                <TableCell>{order.method}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TableServerPagination pagination={orders.pagination} />
    </div>
  );
};

export default SPHPOrderTable;
