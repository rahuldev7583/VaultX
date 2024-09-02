import React from "react";
import { LiaWalletSolid } from "react-icons/lia";

const Navbar = () => {
  return (
    <div className="flex md:mt-8 md:ml-10 mt-4 ml-2">
      <LiaWalletSolid size={32} />

      <h1 className="text-2xl font-bold">VaultX</h1>
    </div>
  );
};

export default Navbar;
