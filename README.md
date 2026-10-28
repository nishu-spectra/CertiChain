# CertiChain — Blockchain Academic Certificate Verification (Starter)

A plain HTML/CSS/JavaScript prototype with MetaMask + Ganache + Solidity. It is not a production-ready identity or credential platform.

## Included pages

- `index.html` — public landing page
- `login.html` — demo login interface + MetaMask connection
- `register.html` — demo institution registration interface
- `dashboard.html` — wallet/network overview
- `issue.html` — issue a record through the smart contract
- `verify.html` — public certificate ID lookup
- `certificate.html` — certificate detail layout placeholder
- `explorer.html` — record lookup interface
- `contracts/CertificateRegistry.sol` — example Solidity contract

## Requirements

- VS Code
- MetaMask browser extension
- Ganache desktop or CLI
- Node.js and npm (for local tooling)
- Remix IDE or Hardhat to compile/deploy the contract

## Quick start (local demo)

1. Open this folder in VS Code.
2. Start Ganache and create a local Ethereum workspace. Copy the RPC URL, chain ID, and a test account.
3. In MetaMask, add the Ganache network using the RPC URL and chain ID. Import a Ganache test account using its private key. **Never import a real wallet into a development environment or share a private key.**
4. Deploy `contracts/CertificateRegistry.sol` to Ganache. For beginners, use Remix:
   - Open Remix IDE.
   - Create `CertificateRegistry.sol` and paste the contract code.
   - Compile using Solidity 0.8.20 or compatible 0.8.x.
   - In Deploy & Run, select `Injected Provider - MetaMask`, confirm MetaMask is connected to Ganache, and deploy.
   - Copy the deployed contract address.
5. Paste that address into `CONTRACT_ADDRESS` in `js/app.js`.
6. Serve this folder through VS Code Live Server (recommended) or another local static server. Do not open pages directly as `file://`.
7. Open `index.html`; connect MetaMask and test issuing and verifying a sample certificate.

## Important limitations

- Login and registration are visual/demo only; there is no secure user database, password handling, or verified institution onboarding.
- Contract owner is the only issuer in this starter. Add institution roles/access control before multiple institutions use it.
- On-chain data is public and immutable. This demo stores names and roll numbers in plain text to keep the learning flow simple. For real use, store only a cryptographic hash and non-sensitive identifier on-chain; keep personal data and PDFs in controlled storage.
- `certificate.html` is a visual template; verification results are currently rendered on `verify.html`.
- The explorer searches a certificate ID; it is not a full block indexer.
- Production deployment needs security review, tests, access control, privacy/legal review, and careful key management.

## Suggested next steps

1. Add OpenZeppelin `AccessControl` or `Ownable` roles.
2. Store a SHA-256 document digest rather than the PDF itself.
3. Add automated contract tests and duplicate/revocation flows.
4. Add backend institution onboarding, audit logs, and rate limiting.

## PHP/MySQL institution authentication

See `README_AUTH_SETUP.md` for XAMPP setup, database import, approval flow, and contract address instructions. Import `database.sql` before using registration/login. New institution accounts are pending until reviewed and approved.
