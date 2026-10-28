// CertiChain: institution authentication uses PHP sessions; certificates remain on the deployed contract.
// IMPORTANT: set this to the DEPLOYED CONTRACT ADDRESS from Remix, not your MetaMask account address.
const CONTRACT_ADDRESS = "0xf3f34e422463b8256DAdDdD86F15a229FFa6546b";
const ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "indexedCertificateId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "studentName",
        type: "string",
      },
    ],
    name: "CertificateIssued",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "certId",
        type: "string",
      },
    ],
    name: "getCertificate",
    outputs: [
      {
        internalType: "string",
        name: "studentName",
        type: "string",
      },
      {
        internalType: "string",
        name: "course",
        type: "string",
      },
      {
        internalType: "string",
        name: "rollNo",
        type: "string",
      },
      {
        internalType: "string",
        name: "issueDate",
        type: "string",
      },
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "certId",
        type: "string",
      },
      {
        internalType: "string",
        name: "studentName",
        type: "string",
      },
      {
        internalType: "string",
        name: "course",
        type: "string",
      },
      {
        internalType: "string",
        name: "rollNo",
        type: "string",
      },
      {
        internalType: "string",
        name: "issueDate",
        type: "string",
      },
    ],
    name: "issueCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCertificates",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
let provider, signer, contract;
function setMessage(text, error = false) {
  const el = document.getElementById("message");
  if (el) {
    el.textContent = text;
    el.className = error ? "message error" : "message";
  }
}
async function api(path, body) {
  const r = await fetch(path, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let d;
  try {
    d = await r.json();
  } catch {
    throw new Error(
      "The server returned an unexpected response. Open this project through XAMPP Apache, not file://.",
    );
  }
  if (!r.ok || d.ok === false) throw new Error(d.message || "Request failed.");
  return d;
}
async function getCsrf() {
  return (await api("api/csrf.php")).csrf_token;
}
async function registerInstitution(event) {
  event?.preventDefault();
  try {
    const token = await getCsrf();
    const data = {
      csrf_token: token,
      institution_name: document.getElementById("institution").value.trim(),
      email: document.getElementById("regEmail").value.trim(),
      wallet_address: document.getElementById("wallet").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      password: document.getElementById("regPassword").value,
    };
    const result = await api("api/register.php", data);
    setMessage(result.message);
    document.getElementById("registerForm").reset();
  } catch (e) {
    setMessage(e.message, true);
  }
}
async function loginInstitution(event) {
  event?.preventDefault();
  try {
    const token = await getCsrf();
    const result = await api("api/login.php", {
      csrf_token: token,
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    });
    setMessage(result.message);
    location.href = "dashboard.html";
  } catch (e) {
    setMessage(e.message, true);
  }
}
async function logoutInstitution() {
  try {
    const token = await getCsrf();
    await api("api/logout.php", { csrf_token: token });
    location.href = "login.html";
  } catch (e) {
    setMessage(e.message, true);
  }
}
async function checkInstitutionSession(redirect = true) {
  try {
    const result = await api("api/me.php");
    if (!result.authenticated) {
      if (redirect) location.href = "login.html";
      return null;
    }
    const el = document.getElementById("institutionName");
    if (el) el.textContent = result.institution.name;
    return result.institution;
  } catch (e) {
    if (redirect) location.href = "login.html";
    return null;
  }
}

// Show/hide password control shared by login and registration pages.
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input || !button) return;
  const currentlyHidden = input.type === "password";
  input.type = currentlyHidden ? "text" : "password";
  button.textContent = currentlyHidden ? "Hide" : "Show";
  button.setAttribute(
    "aria-label",
    currentlyHidden ? "Hide password" : "Show password",
  );
}

document
  .getElementById("registerForm")
  ?.addEventListener("submit", registerInstitution);
document
  .getElementById("loginForm")
  ?.addEventListener("submit", loginInstitution);
// Protect issuer pages in the UI. The contract's own onlyOwner check remains the on-chain security boundary.
if (
  ["dashboard.html", "issue.html"].includes(location.pathname.split("/").pop())
)
  document.addEventListener("DOMContentLoaded", () =>
    checkInstitutionSession(true),
  );
async function connectWallet() {
  try {
    if (!window.ethereum)
      throw new Error(
        "MetaMask is not installed. Install the MetaMask browser extension first.",
      );
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    const network = await provider.getNetwork();
    if (CONTRACT_ADDRESS)
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const address = await signer.getAddress();
    setMessage("Connected: " + address + " · Chain ID " + network.chainId);
    const ws = document.getElementById("walletStatus");
    if (ws) ws.textContent = "Connected";
    const wa = document.getElementById("walletAddress");
    if (wa) wa.textContent = address.slice(0, 8) + "…" + address.slice(-6);
    const ns = document.getElementById("networkStatus");
    if (ns) ns.textContent = String(network.chainId);
    if (contract) {
      try {
        const total = await contract.totalCertificates();
        const tc = document.getElementById("totalCount");
        if (tc) tc.textContent = total.toString();
      } catch (e) {}
    }
    return { provider, signer, contract };
  } catch (e) {
    setMessage(e.message || String(e), true);
    throw e;
  }
}
async function requireContract() {
  if (!window.ethereum) throw new Error("Install MetaMask first.");
  if (!signer) await connectWallet();
  if (!CONTRACT_ADDRESS)
    throw new Error(
      "Set CONTRACT_ADDRESS in js/app.js to the deployed CertificateRegistry contract address from Remix. Do not use your wallet address.",
    );
  if (!contract) contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  return contract;
}
async function issueCertificate() {
  try {
    const institution = await checkInstitutionSession(false);
    if (!institution)
      throw new Error("Please log in with an approved institution account.");
    const c = await requireContract();
    const id = document.getElementById("certId").value.trim(),
      name = document.getElementById("studentName").value.trim(),
      course = document.getElementById("course").value.trim(),
      roll = document.getElementById("rollNo").value.trim(),
      date = document.getElementById("issueDate").value;
    if (!id || !name || !course || !roll || !date)
      throw new Error("Please complete all fields.");
    setMessage("Confirm the transaction in MetaMask…");
    const tx = await c.issueCertificate(id, name, course, roll, date);
    setMessage(
      "Transaction submitted: " + tx.hash + " — waiting for confirmation…",
    );
    await tx.wait();
    setMessage("Certificate issued successfully. Transaction: " + tx.hash);
  } catch (e) {
    setMessage(e.shortMessage || e.reason || e.message || String(e), true);
  }
}
async function getReadProvider() {
  if (!window.ethereum)
    throw new Error(
      "Please install MetaMask and connect it to the same Ganache network used to deploy the contract.",
    );
  if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}
async function readCertificate(id) {
  if (!CONTRACT_ADDRESS)
    throw new Error("The certificate contract address is not configured.");
  const p = await getReadProvider();
  const code = await p.getCode(CONTRACT_ADDRESS);
  if (code === "0x")
    throw new Error(
      "No contract found at the configured address on this network. Switch MetaMask to your Ganache network.",
    );
  const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, p);
  return await c.getCertificate(id);
}
function certificateHtml(id, r) {
  if (!r.exists)
    return "<h2>Certificate not found</h2><p>No certificate with this ID exists on the selected blockchain network.</p>";
  return `<span class="verified-tag">✓ Record found on blockchain</span><h2>${escapeHtml(r.studentName)}</h2><p><b>Certificate ID:</b> ${escapeHtml(id)}</p><p><b>Course:</b> ${escapeHtml(r.course)}</p><p><b>Roll number:</b> ${escapeHtml(r.rollNo)}</p><p><b>Issue date:</b> ${escapeHtml(r.issueDate)}</p><p><b>Issuer wallet:</b> <code>${escapeHtml(r.issuer)}</code></p><p class="muted">This confirms a matching blockchain record; it does not independently certify the institution's legitimacy.</p>`;
}
async function verifyCertificate() {
  const result = document.getElementById("result");
  try {
    const id = document.getElementById("verifyId")?.value.trim();
    if (!id) throw new Error("Enter a certificate ID.");
    const r = await readCertificate(id);
    if (result) {
      result.classList.remove("hidden");
      result.innerHTML = certificateHtml(id, r);
    }
    setMessage("");
  } catch (e) {
    if (result) {
      result.classList.remove("hidden");
      result.innerHTML =
        "<h2>Unable to verify</h2><p>" +
        escapeHtml(e.shortMessage || e.reason || e.message || String(e)) +
        "</p>";
    }
    setMessage(e.shortMessage || e.reason || e.message || String(e), true);
  }
}
async function exploreCertificate() {
  const input = document.getElementById("explorerId"),
    target = document.getElementById("explorerResult");
  try {
    const id = input?.value.trim();
    if (!id) throw new Error("Enter a certificate ID.");
    const r = await readCertificate(id);
    if (target) target.innerHTML = certificateHtml(id, r);
    setMessage("");
  } catch (e) {
    if (target)
      target.innerHTML =
        '<p class="message error">' +
        escapeHtml(e.shortMessage || e.reason || e.message || String(e)) +
        "</p>";
    setMessage(e.shortMessage || e.reason || e.message || String(e), true);
  }
}
async function loadMyCertificates() {
  const body = document.getElementById("myCertificatesBody");
  if (!body) return;
  try {
    const connected = await connectWallet();
    const c = connected.contract;
    if (!c) throw new Error("Contract is not available.");
    const wallet = (await connected.signer.getAddress()).toLowerCase();
    const events = await c.queryFilter(
      c.filters.CertificateIssued(null, wallet),
      0,
      "latest",
    );
    if (!events.length) {
      body.innerHTML =
        '<tr><td colspan="5">No certificates issued by this connected wallet were found.</td></tr>';
      return;
    }
    const seen = new Set(),
      rows = [];
    for (const ev of events) {
      const id = String(ev.args[0]);
      if (seen.has(id)) continue;
      seen.add(id);
      const r = await c.getCertificate(id);
      if (r.exists && String(r.issuer).toLowerCase() === wallet) {
        rows.push(
          `<tr><td>${escapeHtml(id)}</td><td>${escapeHtml(r.studentName)}</td><td>${escapeHtml(r.course)}</td><td>${escapeHtml(r.rollNo)}</td><td>${escapeHtml(r.issueDate)}</td></tr>`,
        );
      }
    }
    body.innerHTML = rows.length
      ? rows.join("")
      : '<tr><td colspan="5">No certificates issued by this wallet were found.</td></tr>';
  } catch (e) {
    body.innerHTML =
      '<tr><td colspan="5">' +
      escapeHtml(e.shortMessage || e.reason || e.message || String(e)) +
      "</td></tr>";
  }
}
function escapeHtml(v) {
  return String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("myCertificatesBody")) loadMyCertificates();
});
