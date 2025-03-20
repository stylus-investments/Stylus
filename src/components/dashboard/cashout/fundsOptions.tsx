"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HandCoins } from "lucide-react";
import React, { useState } from "react";
import CashoutConvert from "./cashout-convert";
import BuySPHP from "../project/sphp/buy-sphp";
import ConvertUsdcToSPHP from "../project/sphp/convert-usdc-to-sphp";

const Cashout = () => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex flex-col gap-1.5 items-center">
          <Button className="w-11 h-11 p-0 rounded-full" variant={"secondary"}>
            <HandCoins size={20} />
          </Button>
          <Label className="text-sm font-normal">Fund</Label>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select Fund Options</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col gap-5">
          <div className="space-y-2 flex items-center justify-between gap-5">
            <div className="space-y-1 flex flex-col">
              <Label>Cash in SPHP</Label>
              <small className="text-muted-foreground">
                Purchase SPHP to process transactions and unlock investment
                opportunities within the app..
              </small>
            </div>
            <BuySPHP />
            {/* <CashoutCompound /> */}
          </div>

          <Separator />

          <div className="space-y-2 flex items-center justify-between gap-5">
            <div className="space-y-1 flex flex-col">
              <Label>Cash out SPHP</Label>
              <small className="text-muted-foreground">
                Cashout your token into real money.
              </small>
            </div>
            <CashoutConvert />
          </div>

          <Separator />

          <div className="space-y-2 flex items-center justify-between gap-5">
            <div className="space-y-1 flex flex-col">
              <Label>Convert USDC into SPHP</Label>
              <small className="text-muted-foreground">
                Exchange USDC for SPHP to process transactions within the app
                and unlock investment opportunities.
              </small>
            </div>
            <ConvertUsdcToSPHP />
          </div>

          <Separator />
        </div>
        <div className="flex w-full items-center gap-5 ">
          <Button
            type="button"
            variant={"secondary"}
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Cashout;
