"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

// Token information interface
interface Token {
  mintAddress: string;
  name: string;
  amount: string;
}

const SolanaWallet = ({ mnemonic }: { mnemonic: string }) => {
  const [keyPairs, setKeyPairs] = useState<
    {
      publicKey: string;
      privateKey: string;
      balance: string;
      tokens: Token[]; // Add tokens to state
      visible: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedWallets = localStorage.getItem("solanaWallets");
    if (savedWallets) {
      const parsedWallets = JSON.parse(savedWallets);
      Promise.all(
        parsedWallets.map(async (wallet: any) => ({
          ...wallet,
          balance: await getBalance(wallet.publicKey),
          tokens: await getTokens(wallet.publicKey), // Fetch tokens
        }))
      ).then((updatedWallets) => {
        setKeyPairs(updatedWallets);
        setLoading(false);
      });
    } else {
      fetchFundedWallets();
    }
  }, []);

  const fetchFundedWallets = async () => {
    setLoading(true);
    const fundedWallets = [];
    for (let i = 0; i < 10; i++) {
      const wallet = await deriveWallet(i);
      // Only add wallet if balance is greater than 0
      if (parseFloat(wallet.balance) > 0) {
        fundedWallets.push(wallet);
      }
    }
    setKeyPairs(fundedWallets);
    localStorage.setItem("solanaWallets", JSON.stringify(fundedWallets));
    setLoading(false);
  };

  const deriveWallet = async (index: number) => {
    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${index}'/0'`; // Correct derivation path for Solana
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keypair = Keypair.fromSecretKey(
      nacl.sign.keyPair.fromSeed(derivedSeed).secretKey
    );
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);
    const balance = await getBalance(publicKey);
    const tokens = await getTokens(publicKey);

    return {
      publicKey,
      privateKey,
      balance,
      tokens,
      visible: false,
    };
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
      return (response.data.result.value / 1e9).toFixed(4).toString(); // Convert from lamports to SOL and ensure it's a string
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "Error";
    }
  };

  const getTokens = async (publicKey: string): Promise<Token[]> => {
    try {
      const SOL_API = process.env.NEXT_PUBLIC_SOL_API || "";
      // Fetch all token accounts for the public key
      const response = await axios.post(
        SOL_API,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            publicKey,
            {
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            },
            {
              encoding: "jsonParsed",
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract token information from the response
      const tokenAccounts = response.data.result.value;

      // Fetch token metadata for each mint address
      const tokensWithMetadata = await Promise.all(
        tokenAccounts.map(async (account: any) => {
          const mintAddress = account.account.data.parsed.info.mint;
          const amount = (
            account.account.data.parsed.info.tokenAmount.uiAmount || 0
          )
            .toFixed(4)
            .toString();

          // Fetch token metadata from an external service
          const tokenMetadata = await getTokenMetadata(mintAddress);

          return {
            mintAddress,
            name: tokenMetadata?.name || mintAddress,
            amount,
          };
        })
      );

      // Filter tokens with balance greater than 0
      return tokensWithMetadata.filter((token) => parseFloat(token.amount) > 0);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      return [];
    }
  };

  const getTokenMetadata = async (mintAddress: string) => {
    try {
      const METAPLEX_API = process.env.NEXT_PUBLIC_METAPLEX_API || "";
      const response = await axios.get(
        `${METAPLEX_API}/metadata/${mintAddress}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      return null;
    }
  };

  const handleDeleteWallet = (index: number) => {
    const updatedKeyPairs = keyPairs.filter((_, i) => i !== index);
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("solanaWallets", JSON.stringify(updatedKeyPairs));
  };

  const toggleVisibility = (index: number) => {
    const updatedKeyPairs = keyPairs.map((keyPair, i) =>
      i === index ? { ...keyPair, visible: !keyPair.visible } : keyPair
    );
    setKeyPairs(updatedKeyPairs);
    localStorage.setItem("solanaWallets", JSON.stringify(updatedKeyPairs));
  };

  const createNewWallet = async () => {
    const newWalletIndex = keyPairs.length;
    const newWallet = await deriveWallet(newWalletIndex);
    setKeyPairs((prevKeyPairs) => [...prevKeyPairs, newWallet]);
    localStorage.setItem(
      "solanaWallets",
      JSON.stringify([...keyPairs, newWallet])
    );
  };

  return (
    <div className="ml-2 md:ml-48 mt-10">
      <div className="w-[98%] md:w-[80%]">
        <button
          className="bg-black text-white hover:bg-gray-600 px-8 py-4 text-lg font-semibold rounded-xl"
          onClick={createNewWallet}
        >
          Add Solana Wallet
        </button>
        {loading ? (
          <p className="mt-6">Loading funded wallets...</p>
        ) : (
          keyPairs.map((keyPair, index) => (
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

              <p className="font-semibold mt-4">
                Balance: {keyPair.balance} SOL
              </p>

              <div className="mt-4">
                <h2 className="text-lg font-semibold">Tokens:</h2>
                {keyPair.tokens.length > 0 ? (
                  keyPair.tokens.map((token, idx) => (
                    <div key={idx} className="flex justify-between mt-2">
                      <span className="font-medium">{token.name}</span>
                      <span className="text-gray-600">
                        {token.amount} tokens
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No tokens found.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SolanaWallet;
