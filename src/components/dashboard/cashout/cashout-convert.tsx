/* eslint-disable react/no-unescaped-entities */
"use client";
import { trpc } from "@/app/_trpc/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BASE_CHAIN_ID, SPHP, USDC_ADDRESS } from "@/lib/token_address";
import { cashoutFormSchema, tCashoutFormSchema } from "@/types/cashoutType";
import { HandCoins, LoaderCircle } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; // Import zod resolver for react-hook-form
import { Checkbox } from "@/components/ui/checkbox";
import { TOKENRECEIVER_ADDRESS } from "@/constant/receiverAddress";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { ABI } from "@/constant/abi";
import { getTokenName } from "@/utils/token";
import { gaslessFuncObj } from "@/utils/gaslessFunc";

const CashoutConvert = () => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof cashoutFormSchema>>({
    resolver: zodResolver(cashoutFormSchema),
    defaultValues: {
      amount: "",
      token_name: "SPHP",
      payment_method: "",
      account_number: "",
      account_name: "",
    },
  });
  const [confirmForm, setConfirmForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { wallets } = useWallets();
  const wallet = wallets[0];

  const [tokenAddress, setTokenAddress] = useState(SPHP);

  const { refetch } = trpc.cashout.qCashoutHistory.useQuery(undefined, {
    enabled: false,
  });

  const getUserInfo = trpc.user.getCurrentUserInfo.useQuery(undefined, {
    enabled: false,
  });

  const tokenName = getTokenName(tokenAddress);

  const useGasCredit = trpc.user.useGasCreditFee.useMutation({
    onSuccess: () => getUserInfo.refetch(),
    onError: (err) => {
      setLoading(false);
      return toast.error(err.message);
    },
  });

  const { isPending, mutateAsync } = trpc.cashout.cashoutToken.useMutation({
    onError: (e) => toast.error(e.message),
    onSuccess: () => {
      refetch();
      toast.success("Cashout request has been successfuly created.");
      setOpen(false);
    },
  });
  const onSubmit = async (values: tCashoutFormSchema) => {
    try {
      const { amount } = values;
      if (!confirmForm)
        return toast.error(
          "Please confirm that all the information you've entered is accurate before proceeding."
        );
      // Proceed with mutation if the form data is valid

      setLoading(true);
      // Check if amount is greater than 0
      if (Number(amount) <= 0) {
        setLoading(false);
        return toast.error("Amount must be greater than 0");
      }

      await wallet.switchChain(BASE_CHAIN_ID);
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner() as any;
      const tokenContract = new ethers.Contract(tokenAddress, ABI, signer);
      const decimals = await tokenContract.decimals();
      // Get the user's balance
      const userWalletAddress = wallet.address; // Get user's wallet address
      const userBalance = await tokenContract.balanceOf(userWalletAddress);

      // Convert the user's balance to a readable format
      const readableBalance = ethers.formatUnits(userBalance, decimals);

      const gasCost = await gaslessFuncObj.estimateGasCost({
        provider,
        userWalletAddress,
        amount,
        decimals,
        recipientAddress: TOKENRECEIVER_ADDRESS,
        setLoading,
        tokenContract,
      });

      if (gasCost) {
        const {
          userEthBalance,
          transactionGasCost,
          gasPrice,
          gasCostInETH,
          convertedAmount,
        } = gasCost;

        if (userEthBalance < transactionGasCost) {
          await useGasCredit.mutateAsync({
            gasAmount: gasCostInETH,
          });
        }

        if (readableBalance < amount) {
          setLoading(false);
          return toast.error("You don't have enough token to cashout.");
        }

        const transactionResponse = await tokenContract.transfer(
          TOKENRECEIVER_ADDRESS,
          convertedAmount
        );

        toast.success("Success! token has been sent.");

        await mutateAsync({
          data: values,
          hash: transactionResponse.hash,
        });
        setLoading(false);
        setOpen(false);
        return;
      }

      toast.error("Please refresh the page.");
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong.");
      console.error("Error sending token:", error);
    }
  };

  // if (!data) return (
  //     <Button className='w-28' disabled>Convert</Button>
  // )

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className="w-28 min-w-28">Cash out</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-96">
          <AlertDialogHeader>
            <AlertDialogTitle>Cashout Token</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to cashout {tokenName}. Review the details carefully
              before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <div className="w-full flex items-center gap-5">
                <FormField
                  control={form.control}
                  name="token_name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Select Token</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Token" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SPHP">SPHP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank, Gcash, Etc.." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Account Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Account Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <div className="flex w-full items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  id="confirmCashout"
                  checked={confirmForm}
                  onCheckedChange={() => setConfirmForm((prev) => !prev)}
                />
                <Label htmlFor="confirmCashout">
                  I confirm that all the information I've entered is accurate
                  and complete.
                </Label>
              </div>
              <Separator />
              <div className="flex w-full items-center gap-5 ">
                <Button
                  type="button"
                  variant={"secondary"}
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button className="w-full" disabled={loading}>
                  {loading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CashoutConvert;
