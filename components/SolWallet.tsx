"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

const SolanaWallet = ({ mnemonic }: { mnemonic: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keyPairs, setKeyPairs] = useState<
    {
      publicKey: string;
      privateKey: string;
      balance: string;
      visible: boolean;
    }[]
  >([]);

  useEffect(() => {
    const savedWallets = localStorage.getItem("solanaWallets");
    if (savedWallets) {
      setKeyPairs(JSON.parse(savedWallets));
      setCurrentIndex(JSON.parse(savedWallets).length);
    }
  }, []);

  const handleAddWallet = async () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey.toBase58();
    const balance = await getBalance(publicKey);

    const newKeyPair = {
      publicKey: publicKey,
      privateKey: bs58.encode(keypair.secretKey),
      balance: balance,
      visible: false,
    };

    const updatedKeyPairs = [...keyPairs, newKeyPair];
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("solanaWallets", JSON.stringify(updatedKeyPairs));
    setCurrentIndex(currentIndex + 1);
  };

  const handleDeleteWallet = (index: number) => {
    const updatedKeyPairs = keyPairs.filter((_, i) => i !== index);
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("solanaWallets", JSON.stringify(updatedKeyPairs));
    setCurrentIndex(updatedKeyPairs.length);
  };

  const toggleVisibility = (index: number) => {
    const updatedKeyPairs = keyPairs.map((keyPair, i) =>
      i === index ? { ...keyPair, visible: !keyPair.visible } : keyPair
    );
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("solanaWallets", JSON.stringify(updatedKeyPairs));
  };

  const getBalance = async (publicKey: string): Promise<string> => {
    try {
      const SOL_API = process.env.NEXT_PUBLIC_SOL_API || "";
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
      return (response.data.result.value / 1e9).toFixed(4);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "Error";
    }
  };

  return (
    <div className="ml-2 md:ml-48 mt-10">
      <button
        className="bg-black text-white hover:bg-gray-600 px-10 py-4 text-lg font-semibold rounded-xl"
        onClick={handleAddWallet}
      >
        Add Solana wallet
      </button>
      <div className="w-[98%] md:w-[80%]">
        {keyPairs.map((keyPair, index) => (
          <div
            key={index}
            className="p-2 md:p-4 md:pl-8 my-4 border border-gray-300 rounded-lg mt-8"
          >
            <div className="flex justify-between">
              <h1 className="font-semibold text-2xl">Wallet {index + 1}</h1>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDeleteWallet(index)}
              >
                <FaTrash />
              </button>
            </div>
            <p className="font-medium mt-6 text-lg">Public key</p>
            <p className="w-[200px] md:w-full truncate overflow-hidden text-ellipsis">
              {keyPair.publicKey}
            </p>
            <p className="font-medium text-lg mt-2">Private key</p>
            <div className="flex justify-between">
              <p className="w-[200px] md:w-full truncate overflow-hidden text-ellipsis">
                {keyPair.visible
                  ? keyPair.privateKey
                  : "************************************************************************************"}
              </p>

              <button
                className="ml-2 text-gray-600 hover:text-gray-800"
                onClick={() => toggleVisibility(index)}
              >
                {keyPair.visible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <p className="font-semibold mt-4">Balance: {keyPair.balance} SOL</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolanaWallet;
