"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ABI } from "@/constant/abi";
import { BASE_CHAIN_ID } from "@/lib/token_address";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { ArrowUp, LoaderCircle, QrCode } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import jsQR from "jsqr";
import { Scanner } from "@yudiel/react-qr-scanner";
import { trpc } from "@/app/_trpc/client";
import { getTokenName } from "@/utils/token";
import { gaslessFuncObj } from "@/utils/gaslessFunc";

const SendToken = () => {
  const [tokenAddress, setTokenAddress] = useState("");

  const tokenName = getTokenName(tokenAddress);
  const walletData = trpc.dashboard.getWalletData.useQuery(undefined, {
    refetchOnMount: false,
    enabled: false,
  });
  const getUserInfo = trpc.user.getCurrentUserInfo.useQuery(undefined, {
    enabled: false,
  });

  const getWalletData = trpc.dashboard.getWalletData.useQuery(undefined, {
    enabled: false,
  });

  const useGasCredit = trpc.user.useGasCreditFee.useMutation({
    onSuccess: () => {
      getUserInfo.refetch();
      getWalletData.refetch();
    },
    onError: (err) => {
      setLoading(false);
      return toast.error(err.message);
    },
  });

  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [formData, setFormData] = useState({
    recipientAddress: "",
    amount: "",
  });

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e: any) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        // Create a canvas to extract image data
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data from the canvas
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) return toast.error("No Image");

        // Use jsQR to decode the QR code from the image data
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          toast.success("Success! Wallet address has been uploaded");
          setFormData((prev) => ({ ...prev, recipientAddress: code.data })); // Set the decoded value
        } else {
          toast.error("QR code is invalid");
        }
      };
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const sendToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { amount, recipientAddress } = formData;
      setLoading(true);
      // Check if amount is greater than 0
      if (Number(amount) <= 0) {
        setLoading(false);
        return toast.error("Amount must be greater than 0");
      }
      if (!ethers.isAddress(recipientAddress)) {
        setLoading(false);
        return toast.error("Invalid wallet address");
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
      if (Number(readableBalance) < Number(amount)) {
        setLoading(false);
        return toast.error("You don't have enough token to cashout.");
      }

      console.log("Estimating gas");

      const gasCost = await gaslessFuncObj.estimateGasCost({
        provider,
        userWalletAddress,
        amount,
        decimals,
        recipientAddress,
        setLoading,
        tokenContract,
      });
      console.log("Gas estimated");

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

        const transactionResponse = await tokenContract.transfer(
          recipientAddress,
          convertedAmount
        );

        setLoading(false);
        setFormData({ recipientAddress: "", amount: "" });
        setOpen(false);
        toast.success("Success! token has been sent.");
        return;
      }

      toast.error("Please refresh the page.");
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong.");
      console.error("Error sending token:", error);
    }
  };

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <div className="flex flex-col gap-1.5 items-center">
            <Button
              className="w-11 h-11 p-0 rounded-full"
              variant={"secondary"}
            >
              <ArrowUp size={20} />
            </Button>
            <Label className="text-sm font-normal">Send</Label>
          </div>
        </AlertDialogTrigger>
        {tokenAddress ? (
          <AlertDialogContent className="max-w-96">
            <AlertDialogHeader>
              <AlertDialogTitle>Transfer Token</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to transfer {tokenName} to the specified
                recipient. Please note that you will need ETH in your wallet to
                cover the transaction fees (gas). Review the details carefully
                before confirming.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={sendToken} className="flex flex-col gap-5">
              <div className="flex w-full items-center gap-5">
                <div className="flex flex-col gap-2">
                  <Label>Upload QR</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Label>QR Code</Label>
                  <AlertDialog open={scannerOpen} onOpenChange={setScannerOpen}>
                    <AlertDialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        Scan
                        <QrCode size={20} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <Scanner
                        onScan={(result) => {
                          const walletAddress = result[0].rawValue;

                          if (!ethers.isAddress(walletAddress)) {
                            return toast.error(
                              "Invalid wallet address. Please scan a valid QR code or enter the address manually."
                            );
                          }

                          setFormData((prev) => ({
                            ...prev,
                            recipientAddress: result[0].rawValue,
                          }));
                          toast.success(
                            "Success! QR code has been scanned. Proceed with your transaction."
                          );
                          setScannerOpen(false);
                        }}
                        onError={(err) => {
                          toast.error(
                            "Failed to scan the QR code. Check the lighting and try again."
                          );
                        }}
                      />
                      <AlertDialogFooter>
                        <Button onClick={() => setTokenAddress("")}>
                          Close
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Wallet Address</Label>
                <Input
                  placeholder="0x..."
                  value={formData.recipientAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recipientAddress: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Amount</Label>
                <Input
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>
              <AlertDialogFooter className="flex items-center flex-row gap-5">
                <AlertDialogCancel
                  className="w-full"
                  onClick={() => setTokenAddress("")}
                >
                  Close
                </AlertDialogCancel>
                <Button className="w-full" disabled={loading}>
                  {loading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        ) : (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Select Token</AlertDialogTitle>
              <AlertDialogDescription>
                Select a specific token to transfer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-3 pb-2">
              {walletData.data?.balances.assets.map((asset, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-md hover:bg-primary border cursor-pointer"
                  onClick={() => setTokenAddress(asset.address)}
                >
                  {asset.name}
                </div>
              ))}
            </div>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
};

export default SendToken;
