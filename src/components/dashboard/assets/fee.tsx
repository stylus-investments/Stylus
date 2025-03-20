"use client";
import { trpc } from "@/app/_trpc/client";
import {
  AlertDialog,
  AlertDialogCancel,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ABI } from "@/constant/abi";
import { TOKENRECEIVER_ADDRESS } from "@/constant/receiverAddress";
import { BASE_CHAIN_ID, SPHP } from "@/lib/token_address";
import { compoundFormSchema, tCompoundFormSchema } from "@/types/cashoutType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { Coins, LoaderCircle } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Fee = () => {
  const { data, refetch } = trpc.user.getCurrentUserInfo.useQuery();

  const [open, setOpen] = useState(false);
  const form = useForm<tCompoundFormSchema>({
    resolver: zodResolver(compoundFormSchema),
    defaultValues: {
      amount: "",
      token_name: "SPHP",
    },
  });
  const [loading, setLoading] = useState(false);

  const wallet = useWallets().wallets.find(
    (item) => item.walletClientType === "privy"
  );

  const [tokenAddress, setTokenAddress] = useState(SPHP);

  const { mutateAsync } = trpc.user.rechargeFee.useMutation({
    onError: (e) => toast.error(e.message),
    onSuccess: () => {
      refetch();
      toast.success(
        "Success! Your SPHP has been converted into Processing Fee."
      );
      setOpen(false);
    },
  });

  const onSubmit = async (values: tCompoundFormSchema) => {
    try {
      if (!wallet)
        return toast.error("Something went wrong, please refresh the page.");

      const { amount } = values;
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
      const userAddress = wallet.address; // Get user's wallet address
      const userBalance = await tokenContract.balanceOf(userAddress);

      // console.log("Balance", userBalance)

      // Convert the user's balance to a readable format
      const readableBalance = ethers.formatUnits(userBalance, decimals);
      // console.log("Readable Balance", readableBalance, amount)

      if (Number(readableBalance) < Number(amount)) {
        setLoading(false);
        return toast.error("You don't have enough token.");
      }

      const convertedAmount = ethers.parseUnits(amount, decimals);

      // console.log("Converted Amount", convertedAmount)

      const transactionResponse = await tokenContract.transfer(
        TOKENRECEIVER_ADDRESS,
        convertedAmount
      );
      // console.log(transactionResponse)

      // const reciept = await transactionResponse.wait()

      // console.log("Receipt", reciept)

      toast.success(
        "Transaction in progress: Your tokens have been received and are being processed for conversion. Please wait for confirmation."
      );

      await mutateAsync({
        data: values,
        hash: transactionResponse.hash,
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong.");
      console.error("Error sending token:", error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex flex-col gap-1.5 items-center">
          <Button className="w-11 h-11 p-0 rounded-full" variant={"secondary"}>
            <Coins />
          </Button>
          <Label className="text-sm font-normal">Fee</Label>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-96">
        <AlertDialogHeader>
          <AlertDialogTitle>Processing Fee</AlertDialogTitle>
          <AlertDialogDescription>
            A small fee required to process your transaction securely and
            efficiently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between">
          <Label className="text-base">
            Fee Credits Left:{" "}
            <strong className="text-base px-2.5 py-0.5 border">
              {data?.gas_credits}
            </strong>
          </Label>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button>Recharge</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-96">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Convert SPHP into Processing Fee
                </AlertDialogTitle>
                <AlertDialogDescription>
                  1 SPHP = 1 Processing Fee
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
        <AlertDialogCancel>Close</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Fee;
