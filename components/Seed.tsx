"use client";
import React from "react";
import { generateMnemonic } from "bip39";

const Seed = ({
  mnemonic,
  setMnemonic,
}: {
  mnemonic: string;
  setMnemonic: (mnemonic: string) => void;
}) => {
  return (
    <div>
      <button
        onClick={async function () {
          const mn = await generateMnemonic();
          setMnemonic(mn);
        }}
      >
        Create Seed Phrase
      </button>
      <br />
      <input className="w-[50%]" readOnly type="text" value={mnemonic}></input>
    </div>
  );
};

export default Seed;
