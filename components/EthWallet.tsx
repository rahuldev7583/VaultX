import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import axios from "axios";

export const EthWallet = ({ mnemonic }: { mnemonic: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keyPairs, setKeyPairs] = useState<
    { publicKey: string; privateKey: string; balance: string }[]
  >([]);

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
    };

    setCurrentIndex(currentIndex + 1);

    setKeyPairs((prevKeyPairs) => [...prevKeyPairs, newKeyPair]);
  };

  const getBalance = async (address: string): Promise<string> => {
    try {
      //   console.log("Fetching balance for address:", address);
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

      console.log("API Response:", response.data);

      const balanceInWei = response.data.result;
      console.log("Balance in Wei:", balanceInWei);
      const balanceInEther = parseInt(balanceInWei, 16) / 1e18;
      console.log(balanceInEther);

      return balanceInEther.toFixed(4);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "Error";
    }
  };

  return (
    <div>
      <button onClick={handleAddWallet}>Add ETH wallet</button>

      {keyPairs.map((keyPair, index) => (
        <div key={index}>
          <p>Public key: {keyPair.publicKey}</p>
          <p>Private key: {keyPair.privateKey}</p>
          <p>Balance: {keyPair.balance} ETH</p>
        </div>
      ))}
    </div>
  );
};
