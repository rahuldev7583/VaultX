"use client";
import React, { useState, useEffect } from "react";
import { generateMnemonic, validateMnemonic } from "bip39";
import { FaChevronUp, FaChevronDown, FaCopy, FaTrash } from "react-icons/fa";
import SolanaWallet from "./SolWallet";
import { EthWallet } from "./EthWallet";

const Seed = ({
  mnemonic,
  setMnemonic,
}: {
  mnemonic: string;
  setMnemonic: (mnemonic: string) => void;
}) => {
  const [seedStatus, setSeedStatus] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [inputSeed, setInputSeed] = useState("");

  useEffect(() => {
    const savedMnemonic = localStorage.getItem("mnemonic");
    if (savedMnemonic) {
      setMnemonic(savedMnemonic);
      setSeedStatus(true);
    }
  }, [setMnemonic]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    alert("Seed phrase copied to clipboard!");
  };

  const deleteSeedPhrase = () => {
    localStorage.removeItem("mnemonic");
    localStorage.removeItem("ethWallets");
    localStorage.removeItem("solanaWallets");
    setMnemonic("");
    setSeedStatus(false);
  };

  const handleGenerateSeedPhrase = async () => {
    const mn = await generateMnemonic();
    setMnemonic(mn);
    localStorage.setItem("mnemonic", mn);
    setSeedStatus(true);
  };

  const handleImportSeedPhrase = () => {
    if (validateMnemonic(inputSeed.trim())) {
      setMnemonic(inputSeed.trim());
      localStorage.setItem("mnemonic", inputSeed.trim());
      setSeedStatus(true);
      setInputSeed(""); // Clear the input field after importing
    } else {
      alert("Invalid seed phrase. Please try again.");
    }
  };

  return (
    <div>
      {!seedStatus ? (
        <div className="md:mt-10 mt-20 text-center">
          <button
            className="bg-black text-white hover:bg-gray-600 px-4 py-4 text-xl font-semibold rounded-xl"
            onClick={handleGenerateSeedPhrase}
          >
            Generate Seed Phrase
          </button>
          <h1 className="mt-6 text-semibold">Or</h1>
          <div className="mt-4">
            <input
              type="text"
              value={inputSeed}
              onChange={(e) => setInputSeed(e.target.value)}
              placeholder="Enter your seed phrase"
              className="border border-gray-400 rounded-lg p-2 w-3/4 md:w-1/2"
            />
            <button
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 font-semibold rounded-xl ml-2 mt-8 md:ml-4 md:mt-0"
              onClick={handleImportSeedPhrase}
            >
              Import Seed Phrase
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="border border-gray-400 rounded-lg p-2 md:p-4 mt-10 mb-8 inline-block md:w-[70%] ml-2 md:ml-48 w-[96%]">
            <div className="flex justify-between items-center mt-4 mb-4">
              <p className="font-semibold ml-2 md:ml-4 text-xl">
                Your Secret Phrase
              </p>
              <div
                className="cursor-pointer"
                onClick={() => setShowMnemonic(!showMnemonic)}
              >
                {showMnemonic ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            {showMnemonic && (
              <div className="mt-6 mb-6 grid grid-cols-3 md:grid-cols-4 gap-2 w-[96%] md:w-[95%] ml-1 md:ml-4">
                {mnemonic.split(" ").map((word, index) => (
                  <span
                    key={index}
                    className="text-gray-800 bg-gray-100 p-3 rounded-md text-center text-lg w-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}{" "}
            {showMnemonic && (
              <div className="mt-6 mb-6 md:mb-2 flex  md:ml-[55%]">
                <button
                  className="flex items-center px-4 py-2 text-md font-semibold rounded-md"
                  onClick={copyToClipboard}
                >
                  <FaCopy className="mr-2" />
                  Copy Seed
                </button>
                <button
                  className="flex items-center px-4 py-2 text-md font-semibold text-white bg-red-500 rounded-md ml-6 md:ml-24"
                  onClick={deleteSeedPhrase}
                >
                  <FaTrash className="mr-2" />
                  Delete Seed
                </button>
              </div>
            )}
          </div>
          <SolanaWallet mnemonic={mnemonic} />
          <EthWallet mnemonic={mnemonic} />
        </>
      )}
    </div>
  );
};

export default Seed;
