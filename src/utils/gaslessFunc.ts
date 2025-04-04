import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { toast, Toaster } from "sonner";
import { SPHP, WALLET_TANKER } from "@/lib/token_address";
import { ABI } from "@/constant/abi";

interface tEstimateGasCost {
    provider: Web3Provider
    userWalletAddress: string
    amount: string
    decimals: any
    tokenContract: ethers.Contract
    recipientAddress: string
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}
const estimateGasCost = async ({ provider, userWalletAddress, amount, decimals, tokenContract, recipientAddress, setLoading }: tEstimateGasCost) => {

    const userNativeBalance = await provider.getBalance(userWalletAddress);
    const gasPrice = (await provider.getFeeData()).gasPrice?.toBigInt();
    const convertedAmount = ethers.parseUnits(amount, decimals);
    const estimatedGas = await tokenContract
        .getFunction("transfer")
        .estimateGas(recipientAddress, convertedAmount);

    console.log("GASPRICE", gasPrice);
    console.log("ESTIMATE GAS", BigInt(estimatedGas));

    if (!gasPrice) {
        setLoading(false);
        toast.error(
            "Failed to fetch gas price. Please try again later."
        );
        return false
    }

    // Ensure both values are BigInt
    const estimatedGasBigInt = BigInt(estimatedGas);

    const transactionGasCost = estimatedGasBigInt * gasPrice;
    console.log("TOTAL GAS COST", transactionGasCost);

    const gasCostInETH = ethers.formatUnits(transactionGasCost, "ether");
    console.log("Gas cost in eth", gasCostInETH);

    const increasedGasCost = transactionGasCost * BigInt(130) / BigInt(100); // Increase by 30%

    console.log("Increased TOTAL GAS COST (30%)", increasedGasCost);

    const userEthBalance = userNativeBalance.toBigInt();

    console.log("USER ETH BALANCE", userEthBalance);

    return { userEthBalance, transactionGasCost: increasedGasCost, gasPrice, convertedAmount, gasCostInETH }
}


interface tCheckSphpBalance {
    signer: any
    userWalletAddress: string

}

const checkSPHPBalance = async ({ signer, userWalletAddress }: tCheckSphpBalance) => {

    const sPHPTokenContract = new ethers.Contract(SPHP, ABI, signer);
    const sPHPDecimals = await sPHPTokenContract.decimals();
    // Get the user's balance
    const userSphpBalance = await sPHPTokenContract.balanceOf(
        userWalletAddress
    );


    toast("Getting SPHP Balance")
    const readableBalance = ethers.formatUnits(userSphpBalance, sPHPDecimals);

    return {
        userSphpBalance: Number(readableBalance),
        sPHPTokenContract,
        sPHPDecimals
    }
}

export const gaslessFuncObj = {
    estimateGasCost,
    checkSPHPBalance,
}