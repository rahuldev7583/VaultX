# VaultX - A Cryptocurrency Wallet

VaultX is a web-based cryptocurrency wallet that allows you to manage your funds on the Solana and Ethereum blockchains. With VaultX, you can generate a new seed phrase, import an existing seed phrase, and create wallets for both Solana and Ethereum.

## Features

Generate Seed Phrase: VaultX allows you to generate a new seed phrase, which can be used to recover your wallet in case of loss or theft.

Import Existing Seed Phrase: If you already have a seed phrase, you can import it and access your existing wallet.

Solana Wallet: VaultX creates a Solana wallet for you, allowing you to view your public key, private key, and token balances.

Ethereum Wallet: VaultX also creates an Ethereum wallet, providing you with your public key, private key, and token balances.

## Getting Started

To run locally VaultX, follow these steps:

Clone the repository: git clone https://github.com/rahuldev7583/vaultx.git

Create a .env.local file in the root directory of the project and add the following environment variables:

NEXT_PUBLIC_SOL_API="SOLANA_API"
NEXT_PUBLIC_ETH_API="ETHEREUM_API"
NEXT_SOL_TOKEN_LIST_API="https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json"

Install dependencies: pnpm install
Start the development server: pnpm run dev
Open your browser and visit http://localhost:3000 to access the VaultX wallet.

## License

VaultX is licensed under the MIT License.
