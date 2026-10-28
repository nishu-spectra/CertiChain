# CertiChain: PHP + MySQL institution registration/login

## What was added

- `api/register.php`: creates institution registrations with `password_hash`; new accounts are `pending`.
- `api/login.php`: verifies password hashes, requires `approved` status, rotates the session ID.
- `api/me.php`, `api/csrf.php`, `api/logout.php`: session state, CSRF token, logout.
- `database.sql`: MySQL schema.
- `register.html`, `login.html`, `js/app.js`: integrated form handling. The Solidity contract file was not changed.
- Issuer dashboard and issue page check for an approved session in the browser. The deployed contract's `onlyOwner` protection is still authoritative on-chain.

## Install on Windows with XAMPP

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Copy the whole project folder into `C:\xampp\htdocs\certichain` (or your XAMPP `htdocs` folder).
3. Open `http://localhost/phpmyadmin`.
4. Choose **Import**, select this project's `database.sql`, and click **Import/Go**. This creates the `certichain` database and `institutions` table.
5. If your MySQL root user has a password, update `DB_PASS` in `config.php`. Default XAMPP often uses an empty root password for local development.
6. Visit `http://localhost/certichain/index.html`. Do **not** open the HTML file directly using a `file:///` URL; PHP requires Apache.
7. Register an institution. It will be pending approval, so login is blocked until you approve it.

## Approve an institution (local development only)

Review the institution using phpMyAdmin > `certichain` > `institutions`. Change only the row you have independently verified:

```sql
UPDATE institutions SET status = 'approved' WHERE email = 'verified-institution@example.edu' AND status = 'pending';
```

Never auto-approve public registrations in a real deployment. Add a protected administrator approval workflow and verify official institutional identity before approving accounts. Do not expose a public admin endpoint or use a hard-coded admin password.

## Important contract address note

Open `js/app.js` and set `CONTRACT_ADDRESS` to the **deployed CertificateRegistry contract address shown under Remix > Deploy & Run Transactions > Deployed Contracts**. Do not use the MetaMask account address. Confirm MetaMask is connected to the same Ganache network where you deployed the contract. This project scaffold leaves the address blank intentionally because the deployer account address is not the contract address.

## Security / architecture notes

- Passwords are never stored as plain text; PHP's `password_hash` and `password_verify` are used.
- Prepared statements are used for database queries; session cookies are HttpOnly and SameSite=Lax; session IDs rotate after login; state-changing API requests require a CSRF token.
- This is a local educational implementation. Before internet deployment, enable HTTPS, verify institutional identities, implement a secure admin approval workflow, rate-limit login/registration, monitor logs, and review privacy/legal requirements.
- The smart contract is unchanged. Its `onlyOwner` rule means only the deploying owner wallet can issue on-chain certificates unless the contract itself is changed and redeployed. A PHP session does not grant on-chain authority. Do not assume a database-approved institution can issue certificates unless the contract's authorization model supports that institution.
- Certificate data written by the current Solidity contract may be publicly visible on-chain. Avoid sensitive personal data.
