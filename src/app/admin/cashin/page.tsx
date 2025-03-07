import { caller } from "@/app/_trpc/server";
import AdminHeader from "@/components/admin/admin-header";
import SPHPOrderTable from "@/components/admin/order/sphp-order-table";
import { cookies } from "next/headers";
import React from "react";

const CashoutPage = async ({
  searchParams,
}: {
  searchParams: {
    status:  string;
    page: string;
    request_chat: string;
  };
}) => {
  cookies();

  const cashoutList = await caller.token.qAllSPHPOrder({
    page: searchParams.page,
    status: searchParams.status,
  });
  const filter = {
    status: searchParams.status,
    request_chat: searchParams.request_chat,
  };

  return (
    <>
      <AdminHeader currentPage="cashout" />
      <SPHPOrderTable orders={cashoutList} filter={filter} />
    </>
  );
};

export default CashoutPage;
