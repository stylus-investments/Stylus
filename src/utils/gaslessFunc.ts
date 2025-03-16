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

    const userEthBalance = userNativeBalance.toBigInt();

    console.log("USER ETH BALANCE", userEthBalance);

    return { userEthBalance, transactionGasCost, gasPrice, convertedAmount }
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

interface tSendUserGas {
    sPHPTokenContract: ethers.Contract
    userSphpBalance: number
    gasPrice: bigint
    transactionGasCost: bigint
    userWalletAddress: string

}

const sendUserGas = async ({
    sPHPTokenContract,
    userSphpBalance,
    gasPrice,
    transactionGasCost,
    userWalletAddress
}: tSendUserGas) => {
    // Estimate gas for sending SPHP to your wallet
    const estimatedGasForSPHPTransfer = await sPHPTokenContract
        .getFunction("transfer")
        .estimateGas(WALLET_TANKER, userSphpBalance);
    const sPHPTransferGasCost = estimatedGasForSPHPTransfer * gasPrice;
    const totalEthNeeded = ethers.formatUnits(transactionGasCost + sPHPTransferGasCost, "ether");

    console.log(
        `Total ETH needed for gas: ${totalEthNeeded}`
    );

    const provider = new ethers.JsonRpcProvider(
        process.env.MORALIS_RPC_URL
    ); // Your RPC URL
    const senderWallet = new ethers.Wallet(
        process.env.ASSET_WALLET_PRIVATE_KEY as string,
        provider
    ); // Wallet used to send gas fees


    toast.success("Sending Gas")
    const tx = await senderWallet.sendTransaction({
        to: userWalletAddress,
        value: totalEthNeeded, // Amount in Wei
    });

    console.log("Transaction sent:", tx.hash);

    await tx.wait(); // Wait for confirmation
    console.log("Transaction confirmed:", tx.hash);


    toast.success("Gass fee has been sent.")
}


export const gaslessFuncObj = {
    estimateGasCost,
    checkSPHPBalance,
    sendUserGas
}