"use client";
import React, { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import axios from "axios";
import { FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

export const EthWallet = ({ mnemonic }: { mnemonic: string }) => {
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
    const savedWallets = localStorage.getItem("ethWallets");
    if (savedWallets) {
      setKeyPairs(JSON.parse(savedWallets));
      setCurrentIndex(JSON.parse(savedWallets).length);
    }
  }, []);

  const handleAddWallet = async () => {
    if (!mnemonic) return;

    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);

    const balance = await getBalance(wallet.address);
    const newKeyPair = {
      publicKey: wallet.address,
      privateKey: privateKey,
      balance: balance,
      visible: false,
    };

    const updatedKeyPairs = [...keyPairs, newKeyPair];
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("ethWallets", JSON.stringify(updatedKeyPairs));
    setCurrentIndex(currentIndex + 1);
  };

  const handleDeleteWallet = (index: number) => {
    const updatedKeyPairs = keyPairs.filter((_, i) => i !== index);
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("ethWallets", JSON.stringify(updatedKeyPairs));
    setCurrentIndex(updatedKeyPairs.length);
  };

  const toggleVisibility = (index: number) => {
    const updatedKeyPairs = keyPairs.map((keyPair, i) =>
      i === index ? { ...keyPair, visible: !keyPair.visible } : keyPair
    );
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("ethWallets", JSON.stringify(updatedKeyPairs));
  };

  const getBalance = async (address: string): Promise<string> => {
    try {
      const ETH_API = process.env.NEXT_PUBLIC_ETH_API || "";
      const response = await axios.post(
        ETH_API,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const balanceInWei = response.data.result;
      const balanceInEther = parseInt(balanceInWei, 16) / 1e18;

      return balanceInEther.toFixed(4);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "Error";
    }
  };

  return (
    <div className="ml-2 md:ml-48 mt-10">
      <button
        className="bg-black text-white hover:bg-gray-600 px-8 py-4 text-lg font-semibold rounded-xl"
        onClick={handleAddWallet}
      >
        Add Ethereum Wallet
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
            <p className="font-medium mt-6 text-lg">Public Key</p>
            <p className="w-[200px] md:w-full truncate overflow-hidden text-ellipsis">
              {keyPair.publicKey}
            </p>
            <p className="font-medium text-lg mt-2">Private Key</p>
            <div className="flex justify-between">
              <p className="w-[200px] md:w-full truncate overflow-hidden text-ellipsis">
                {keyPair.visible
                  ? keyPair.privateKey
                  : "****************************************************************************"}
              </p>

              <button
                className="ml-2 text-gray-600 hover:text-gray-800"
                onClick={() => toggleVisibility(index)}
              >
                {keyPair.visible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="font-semibold mt-4">Balance: {keyPair.balance} ETH</p>
          </div>
        ))}
      </div>
    </div>
  );
};
