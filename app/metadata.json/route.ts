import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      name: "DevCoin",
      symbol: "DC",
      description:
        "This is an example fungible token for demonstration purposes.",
      image:
        "https://png.pngtree.com/png-vector/20200902/ourmid/pngtree-golden-dollar-coin-money-png-image_2337468.jpg",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
