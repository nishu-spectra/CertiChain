CERTICHAIN PATCH — 2026-10-24

Files updated:
- js/app.js: sets the known deployed CertificateRegistry address, reads issuer from on-chain record, fixes explorer lookup, and loads dashboard certificates by connected MetaMask issuer wallet.
- verify.html: removes the public-facing configuration note.
- explorer.html: explains that lookup reads directly from the contract.
- register.html: adds required contact number.
- api/register.php: validates and stores contact.
- database.sql: new installs include institutions.contact.
- dashboard.html + css/style.css: adds certificate table.

IMPORTANT:
1. Contract address configured: 0xf3f34e422463b8256DAdDdD86F15a229FFa6546b
2. MetaMask must be connected to the same Ganache network on which this contract is deployed. If Ganache is restarted/reset, deploy again and update the address.
3. For an EXISTING database, inspect the institutions table first. If there is no contact column, run CONTACT_COLUMN_MIGRATION.sql once. Do not run it if the column already exists.
4. Dashboard list shows records whose on-chain issuer matches the currently connected MetaMask wallet. The current CertificateRegistry contract has an onlyOwner restriction, so institution login alone does not authorize independent institutions to issue certificates. That requires a contract change and redeployment.
5. This package is a patch based on the project files available in the conversation. Test on local XAMPP + Ganache before using it elsewhere.
