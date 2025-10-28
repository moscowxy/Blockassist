import { NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { base } from "viem/chains";

const contractABI = [
  {
    name: "startGame",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ name: "gameId", type: "uint256" }],
  },
  {
    name: "getRequiredETHAmount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function POST(req: Request) {
  try {
    const { button } = await req.json();

    // 1 - 5 - 10 dolar bet seçenekleri (button: 1,2,3)
    const usdValues: Record<number, number> = {
      1: 1,
      2: 5,
      3: 10,
    };

    const usdAmount = usdValues[button] || 1;

    // Gerçek zamanlı ETH fiyatını al (USD bazlı)
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await res.json();
    const ethPrice = data.ethereum.usd;

    // USD → ETH dönüşümü
    const ethValue = BigInt(Math.floor((usdAmount / ethPrice) * 1e18));

    // Contract fonksiyonu encode et
    const txData = encodeFunctionData({
      abi: contractABI,
      functionName: "startGame",
      args: [],
    });

    // Base üzerinde işlem oluştur
    return NextResponse.json({
      type: "frame_action",
      chain: base.id,
      action: {
        type: "transaction",
        chain: "base",
        to: "0x299fb0B3bbd0A65B0FB4F16e5AD5CE5afc6dBCfe", // contract adresin
        value: `0x${ethValue.toString(16)}`,
        data: txData,
      },
    });
  } catch (error) {
    console.error("Bet API Error:", error);
    return NextResponse.json(
      { error: "Failed to process bet" },
      { status: 500 }
    );
  }
}

