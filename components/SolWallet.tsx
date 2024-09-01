"use client";
import React, { useState } from "react";
import axios from "axios";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

const SolanaWallet = ({ mnemonic }: { mnemonic: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keyPairs, setKeyPairs] = useState<
    { publicKey: string; privateKey: string; balance: string }[]
  >([]);

  const handleAddWallet = async () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    setCurrentIndex(currentIndex + 1);
    const publicKey = keypair.publicKey.toBase58();
    const balance = await getBalance(publicKey);

    const newKeyPair = {
      publicKey: publicKey,
      privateKey: bs58.encode(keypair.secretKey),
      balance: balance,
    };

    setKeyPairs([...keyPairs, newKeyPair]);
  };

  const getBalance = async (publicKey: string): Promise<string> => {
    console.log("Fetching balance for address:", publicKey);
    try {
      const SOL_API = process.env.NEXT_PUBLIC_SOL_API || "";
      console.log("Solana API URL:", SOL_API);

      const response = await axios.post(
        SOL_API,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [publicKey],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response Status:", response.status);
      console.log("API Response Data:", response.data);

      return (response.data.result.value / 1e9).toFixed(4);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "Error";
    }
  };

  return (
    <div>
      <button onClick={handleAddWallet}>Add SOL wallet</button>
      {keyPairs.map((keyPair, index) => (
        <div key={index}>
          <p>Public key: {keyPair.publicKey}</p>
          <p>Private key: {keyPair.privateKey}</p>
          <p>Balance: {keyPair.balance} SOL</p>
        </div>
      ))}
    </div>
  );
};

export default SolanaWallet;
