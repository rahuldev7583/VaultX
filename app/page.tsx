"use client";
import { EthWallet } from "@/components/EthWallet";
import Navbar from "@/components/Navbar";
import Seed from "@/components/Seed";
import SolanaWallet from "@/components/SolWallet";
import { useState } from "react";

export default function Home() {
  const [mnemonic, setMnemonic] = useState<string>("");

  return (
    <main className="">
      <Navbar />
      <Seed mnemonic={mnemonic} setMnemonic={setMnemonic} />
      <SolanaWallet mnemonic={mnemonic} />
      <EthWallet mnemonic={mnemonic} />
    </main>
  );
}
