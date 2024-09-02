"use client";
import Navbar from "@/components/Navbar";
import Seed from "@/components/Seed";
import { useState } from "react";

export default function Home() {
  const [mnemonic, setMnemonic] = useState<string>("");

  return (
    <main className="">
      <Navbar />
      <Seed mnemonic={mnemonic} setMnemonic={setMnemonic} />
    </main>
  );
}
