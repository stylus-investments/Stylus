import { caller } from "@/app/_trpc/server";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardLinksFooter from "@/components/dashboard/dashboard-links-footer";
import EmergencyContact from "@/components/dashboard/profile/emergency-contact";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  cookies();
  try {
    const initialInfo = (await caller.user.getCurrentUserInfo())
      .emergency_contact[0];

    return (
      <div>
        <DashboardHeader currentPage="profile" />
        <DashboardLinksFooter currentPage="profile" />
        <EmergencyContact contactInfo={initialInfo} />
      </div>
    );
  } catch (error) {
    console.log(error);
    redirect("/dashboard/wallet");
  }
};

export default Page;
