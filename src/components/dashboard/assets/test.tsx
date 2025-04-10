import { ethers } from "ethers";
import { JsonRpcSigner } from '@ethersproject/providers';

// Constants
const UNISWAP_ROUTER_ADDRESS = "0x6ff5693b99212da76ad316178a184ab56d299b43";
const USDC_ADDRESS = "0xA0b86991C6218b36c1d19D4A2e9Eb0Ce3606eB48"; // USDC
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function allowance(address owner, address spender) public view returns (uint256)", // Add this line
];
const ROUTER_ABI = [
  "function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external returns (uint256)",
];

export async function swapTokens(
  signer: JsonRpcSigner,
  amountIn: ethers.BigNumberish
) {
  const userAddress = await signer.getAddress();

  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer as any);
  const router = new ethers.Contract(
    UNISWAP_ROUTER_ADDRESS,
    ROUTER_ABI,
    signer as any
  );

  // Approve Uniswap Router to spend USDC
  const allowance = await usdc.allowance(userAddress, UNISWAP_ROUTER_ADDRESS);
  if (allowance.lt(amountIn)) {
    const approvalTx = await usdc.approve(
      UNISWAP_ROUTER_ADDRESS,
      ethers.MaxUint256
    );
    await approvalTx.wait();
    console.log("Approved USDC for Router");
  }

  // Create swap path: USDC -> WETH
  const path = ethers.solidityPacked(
    ["address", "address"],
    [USDC_ADDRESS, WETH_ADDRESS]
  );

  // Swap USDC to WETH
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
  const tx = await router.exactInput({
    path: path,
    recipient: userAddress,
    deadline: deadline,
    amountIn: amountIn,
    amountOutMinimum: 0, // No slippage protection (use with caution)
  });

  const receipt = await tx.wait();
  console.log("Swap completed:", receipt.transactionHash);
}
