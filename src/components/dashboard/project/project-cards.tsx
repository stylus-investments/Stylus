"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LabelSeparator from "@/components/ui/label-separator";
import { HandCoins, PiggyBank } from "lucide-react";
import Link from "next/link";
import React from "react";
import CreateInvestment from "../investment-plan/create-investment";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import BuySPHP from "./sphp/buy-sphp";
import { PhilippinePeso } from "lucide-react";
import Cashout from "../cashout/fundsOptions";
import CashoutConvert from "../cashout/cashout-convert";

const ProjectCards = () => {
  return (
    <div className="flex flex-col md:flex-row lg:gap-20  gap-10 py-28 padding w-full">
      <div className="space-y-2 w-full">
        <LabelSeparator text="sBTC" />
        <Card>
          <CardHeader>
            <CardTitle className="flex w-full items-center justify-between text-lg">
              <div>sBTC Investments</div>
              <HandCoins />
            </CardTitle>
            <CardDescription>
              <Separator className="my-2" />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center w-full gap-5">
            <Link href={"/dashboard/wallet/plans"} className="w-full">
              <Button className="w-full">Investment Plans</Button>
            </Link>
            <CreateInvestment />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-2 w-full">
        <LabelSeparator text="sAVE" />
        <Card>
          <CardHeader>
            <CardTitle className="flex w-full items-center justify-between text-lg">
              <div>sAVE Investments</div>
              <PiggyBank />
            </CardTitle>
            <CardDescription>Gives you 3% reward per month</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center">
            <Button className="w-full" onClick={() => toast("Coming Soon.")}>
              Buy Save
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-2 w-full">
        <LabelSeparator text="sPHP" />
        <Card>
          <CardHeader>
            <CardTitle className="flex w-full items-center justify-between text-lg">
              <div>sPHP Investments</div>
              <PhilippinePeso />
            </CardTitle>
            <CardDescription>
              <Separator className="my-2" />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center w-full gap-5">
            <Link href={"/dashboard/wallet/sphp-orders"} className="w-full">
              <Button className="w-full">SPHP Orders</Button>
            </Link>
            <BuySPHP />
            <CashoutConvert />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectCards;
