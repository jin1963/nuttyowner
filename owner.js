(() => {
  "use strict";
  const C = window.APP_CONFIG;

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const setStatus = (msg) => { const el = $("status"); if (el) el.textContent = msg; };

  const shortAddr = (a) => a ? (a.slice(0, 6) + "..." + a.slice(-4)) : "-";
  const fmt = (v, dec=18, p=6) => {
    try{
      const s = ethers.formatUnits(v, dec);
      const [i, f=""] = s.split(".");
      return f.length ? `${i}.${f.slice(0,p)}` : i;
    }catch{ return "-"; }
  };

  const parseU = (txt, dec=18) => {
    const t = String(txt || "").trim();
    if (!t) return 0n;
    return ethers.parseUnits(t, dec);
  };

  // ---------- State ----------
  let provider=null, signer=null, user=null;
  let usdt=null, vault=null, core=null, earn=null, ref=null, bin=null;
  let usdtDec=18;

  async function ensureBSC() {
    const net = await provider.getNetwork();
    $("netText").textContent = `${net.name} (${Number(net.chainId)})`;
    if (Number(net.chainId) === C.CHAIN_ID_DEC) return true;

    setStatus("Switching network to BSC...");
    try{
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: C.CHAIN_ID_HEX }]
      });
      return true;
    }catch(e){
      if (e && (e.code===4902 || String(e.message||"").includes("Unrecognized"))) {
        try{
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: C.CHAIN_ID_HEX,
              chainName: C.CHAIN_NAME,
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              rpcUrls: [C.RPC_URL],
              blockExplorerUrls: [C.BLOCK_EXPLORER],
            }]
          });
          return true;
        }catch{
          setStatus("❌ Cannot add/switch chain. Please switch to BSC manually.");
          return false;
        }
      }
      setStatus("❌ Please switch to BSC Mainnet manually.");
      return false;
    }
  }

  function bindContracts() {
    // ERC20 USDT (decimals/parse)
    usdt = new ethers.Contract(C.TOKENS.USDT, C.ABI_ERC20, signer);

    vault = new ethers.Contract(C.CONTRACTS.VAULT365, C.ABI.VAULT365, signer);
    core  = new ethers.Contract(C.CONTRACTS.CORE,     C.ABI.CORE,     signer);
    earn  = new ethers.Contract(C.CONTRACTS.EARNINGS, C.ABI.EARNINGS, signer);
    ref   = new ethers.Contract(C.CONTRACTS.REFERRAL, C.ABI.REFERRAL, signer);
    bin   = new ethers.Contract(C.CONTRACTS.BINARY,   C.ABI.BINARY,   signer);
  }

  function fillStatics() {
    $("ownerAddr").textContent = C.OWNER_TREASURY;

    $("coreAddr").textContent  = C.CONTRACTS.CORE;
    $("vaultAddr").textContent = C.CONTRACTS.VAULT365;
    $("earnAddr").textContent  = C.CONTRACTS.EARNINGS;
    $("refAddr").textContent   = C.CONTRACTS.REFERRAL;
    $("binAddr").textContent   = C.CONTRACTS.BINARY;

    // default inputs
    $("inpVaultCore").value = C.CONTRACTS.CORE;
    $("inpCoreVault").value = C.CONTRACTS.VAULT365;
    $("inpCoreEarn").value  = C.CONTRACTS.EARNINGS;
    $("inpCoreTreasury").value = C.OWNER_TREASURY;

    $("inpEarnCore").value = C.CONTRACTS.CORE;
    $("inpEarnRef").value  = C.CONTRACTS.REFERRAL;
    $("inpEarnBin").value  = C.CONTRACTS.BINARY;
    $("inpEarnTreasury").value = C.OWNER_TREASURY;

    $("inpRefEarn").value  = C.CONTRACTS.EARNINGS;
    $("inpRefVault").value = C.CONTRACTS.VAULT365;

    $("inpBinEarn").value  = C.CONTRACTS.EARNINGS;
    $("inpBinRef").value   = C.CONTRACTS.REFERRAL;
    $("inpBinVault").value = C.CONTRACTS.VAULT365;
  }

  async function connect() {
    if (!window.ethereum) return alert("ไม่พบ Wallet (MetaMask/Bitget)");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    user = await signer.getAddress();

    const ok = await ensureBSC();
    if (!ok) return;

    bindContracts();

    try { usdtDec = Number(await usdt.decimals()); } catch { usdtDec = 18; }

    $("walletText").textContent = `${shortAddr(user)} (connected)`;

    // owner check (optional warning)
    if (user.toLowerCase() !== C.OWNER_TREASURY.toLowerCase()) {
      setStatus("⚠️ Warning: wallet นี้ไม่ใช่ OWNER/TREASURY ที่ตั้งไว้! ปุ่ม admin อาจ revert.");
    } else {
      setStatus("✅ Owner connected.");
    }

    fillStatics();
    await refreshRead();
  }

  // ---------- TX helper ----------
  async function sendTx(fn, label) {
    try{
      setStatus("⏳ " + label + "...");
      const tx = await fn();
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Done: ${label}`);
      await refreshRead();
    }catch(e){
      setStatus("❌ " + label + " failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- Refresh Read ----------
  async function refreshRead() {
    if (!user) return;

    // Vault
    try{
      $("v_core").textContent = await vault.core();
      $("v_rate").textContent = (await vault.thbcToNuttyRate()).toString();
      $("v_reserved").textContent = fmt(await vault.reservedTotal(), 18, 6);
      $("v_excess").textContent = fmt(await vault.nuttyExcess(), 18, 6);
    }catch{
      $("v_core").textContent = "-"; $("v_rate").textContent="-"; $("v_reserved").textContent="-"; $("v_excess").textContent="-";
    }

    // Core
    try{
      $("c_vault").textContent = await core.vault();
      $("c_treasury").textContent = await core.treasury();
      $("c_earn").textContent = await core.earnings();
      $("c_bp").textContent = (await core.commissionPoolBP()).toString();
    }catch{
      $("c_vault").textContent="-"; $("c_treasury").textContent="-"; $("c_earn").textContent="-"; $("c_bp").textContent="-";
    }

    // Earnings
    try{
      $("e_core").textContent = await earn.packagesCore();
      $("e_treasury").textContent = await earn.treasury();
      $("e_ref").textContent = await earn.referralModule();
      $("e_bin").textContent = await earn.binaryModule();
      $("e_global").textContent = fmt(await earn.globalAccrued(), usdtDec, 6);
      $("e_w90").textContent = (await earn.WINDOW_90D()).toString();
    }catch{
      $("e_core").textContent="-"; $("e_treasury").textContent="-"; $("e_ref").textContent="-"; $("e_bin").textContent="-";
      $("e_global").textContent="-"; $("e_w90").textContent="-";
    }

    // Referral
    try{
      $("r_earn").textContent = await ref.earn();
      $("r_vault").textContent = await ref.vault();
    }catch{
      $("r_earn").textContent="-"; $("r_vault").textContent="-";
    }

    // Binary
    try{
      $("b_earn").textContent = await bin.earn();
      $("b_ref").textContent = await bin.referral();
      $("b_vault").textContent = await bin.vault();
    }catch{
      $("b_earn").textContent="-"; $("b_ref").textContent="-"; $("b_vault").textContent="-";
    }
  }

  // ---------- Wire All ----------
  async function wireAll() {
    if (!user) return alert("Connect ก่อน");
    // ทำทีละขั้น เพื่อให้เห็น error ชัด
    await sendTx(() => vault.setCore(C.CONTRACTS.CORE), "Vault.setCore(Core)");
    await sendTx(() => core.setVault(C.CONTRACTS.VAULT365), "Core.setVault(Vault)");
    await sendTx(() => core.setEarnings(C.CONTRACTS.EARNINGS), "Core.setEarnings(Earnings)");
    await sendTx(() => core.setTreasury(C.OWNER_TREASURY), "Core.setTreasury(Owner/Treasury)");

    // mapping pkgRank: 0->Bronze(1), 1->Silver(2), 2->Gold(3)
    await sendTx(() => core.setPkgRank(0, 1), "Core.setPkgRank(0,Bronze)");
    await sendTx(() => core.setPkgRank(1, 2), "Core.setPkgRank(1,Silver)");
    await sendTx(() => core.setPkgRank(2, 3), "Core.setPkgRank(2,Gold)");

    await sendTx(() => earn.setPackagesCore(C.CONTRACTS.CORE), "Earnings.setPackagesCore(Core)");
    await sendTx(() => earn.setModules(C.CONTRACTS.REFERRAL, C.CONTRACTS.BINARY), "Earnings.setModules(Ref,Bin)");
    await sendTx(() => earn.setTreasury(C.OWNER_TREASURY), "Earnings.setTreasury(Owner/Treasury)");

    await sendTx(() => ref.setEarn(C.CONTRACTS.EARNINGS), "Referral.setEarn(Earnings)");
    await sendTx(() => ref.setVault(C.CONTRACTS.VAULT365), "Referral.setVault(Vault)");

    await sendTx(() => bin.setEarn(C.CONTRACTS.EARNINGS), "Binary.setEarn(Earnings)");
    await sendTx(() => bin.setReferral(C.CONTRACTS.REFERRAL), "Binary.setReferral(Referral)");
    await sendTx(() => bin.setVault(C.CONTRACTS.VAULT365), "Binary.setVault(Vault)");
  }

  // ---------- Bind UI ----------
  function bindUI() {
    $("btnConnect").addEventListener("click", connect);
    $("btnRefresh").addEventListener("click", refreshRead);
    $("btnWireAll").addEventListener("click", wireAll);

    // Vault
    $("btnVaultSetCore").addEventListener("click", () => {
      const a = $("inpVaultCore").value.trim();
      if (!ethers.isAddress(a)) return alert("core address ไม่ถูกต้อง");
      sendTx(() => vault.setCore(a), "Vault.setCore");
    });

    $("btnVaultSetRate").addEventListener("click", () => {
      const r = BigInt($("inpRate").value.trim() || "0");
      if (r <= 0n) return alert("rate ต้องมากกว่า 0");
      sendTx(() => vault.setRate(r), "Vault.setRate");
    });

    $("btnWithdrawNuttyExcess").addEventListener("click", () => {
      const amt = BigInt($("inpNuttyExcess").value.trim() || "0");
      if (amt <= 0n) return alert("amount ต้องมากกว่า 0");
      sendTx(() => vault.ownerWithdrawNuttyExcess(amt), "Vault.withdrawNuttyExcess");
    });

    $("btnWithdrawTHBC_V").addEventListener("click", () => {
      const amt = BigInt($("inpWithdrawTHBC_V").value.trim() || "0");
      if (amt <= 0n) return alert("amount ต้องมากกว่า 0");
      sendTx(() => vault.ownerWithdrawTHBC(amt), "Vault.withdrawTHBC");
    });

    // Core
    $("btnCoreSetVault").addEventListener("click", () => {
      const a = $("inpCoreVault").value.trim();
      if (!ethers.isAddress(a)) return alert("vault addr ไม่ถูกต้อง");
      sendTx(() => core.setVault(a), "Core.setVault");
    });

    $("btnCoreSetEarn").addEventListener("click", () => {
      const a = $("inpCoreEarn").value.trim();
      if (!ethers.isAddress(a)) return alert("earnings addr ไม่ถูกต้อง");
      sendTx(() => core.setEarnings(a), "Core.setEarnings");
    });

    $("btnCoreSetTreasury").addEventListener("click", () => {
      const a = $("inpCoreTreasury").value.trim();
      if (!ethers.isAddress(a)) return alert("treasury addr ไม่ถูกต้อง");
      sendTx(() => core.setTreasury(a), "Core.setTreasury");
    });

    $("btnSetBP").addEventListener("click", () => {
      const bp = Number(($("inpBP").value || "").trim());
      if (!Number.isFinite(bp) || bp < 0 || bp > 10000) return alert("bp 0-10000");
      sendTx(() => core.setCommissionPoolBP(bp), "Core.setCommissionPoolBP");
    });

    $("btnSetBuyEnabled").addEventListener("click", () => {
      const on = $("selBuyEnabled").value === "true";
      sendTx(() => core.setBuyEnabled(on), "Core.setBuyEnabled");
    });

    $("btnSetPkgRank").addEventListener("click", () => {
      const pid = Number(($("inpPkgId").value || "").trim());
      const r = Number(($("inpRank").value || "").trim());
      if (![0,1,2].includes(pid)) return alert("pkgId ต้องเป็น 0..2");
      if (![1,2,3].includes(r)) return alert("rank: 1 Bronze, 2 Silver, 3 Gold");
      sendTx(() => core.setPkgRank(pid, r), "Core.setPkgRank");
    });

    $("btnWithdrawUSDT_C").addEventListener("click", () => {
      const amt = parseU($("inpWithdrawUSDT_C").value, usdtDec);
      if (amt <= 0n) return alert("amount > 0");
      sendTx(() => core.ownerWithdrawUSDT(amt), "Core.withdrawUSDT");
    });

    $("btnWithdrawTHBC_C").addEventListener("click", () => {
      const amt = BigInt($("inpWithdrawTHBC_C").value.trim() || "0");
      if (amt <= 0n) return alert("amount > 0");
      sendTx(() => core.ownerWithdrawTHBC(amt), "Core.withdrawTHBC");
    });

    // Earnings
    $("btnEarnSetCore").addEventListener("click", () => {
      const a = $("inpEarnCore").value.trim();
      if (!ethers.isAddress(a)) return alert("core addr ไม่ถูกต้อง");
      sendTx(() => earn.setPackagesCore(a), "Earnings.setPackagesCore");
    });

    $("btnEarnSetModules").addEventListener("click", () => {
      const r = $("inpEarnRef").value.trim();
      const b = $("inpEarnBin").value.trim();
      if (!ethers.isAddress(r) || !ethers.isAddress(b)) return alert("ref/bin addr ไม่ถูกต้อง");
      sendTx(() => earn.setModules(r, b), "Earnings.setModules");
    });

    $("btnEarnSetTreasury").addEventListener("click", () => {
      const a = $("inpEarnTreasury").value.trim();
      if (!ethers.isAddress(a)) return alert("treasury addr ไม่ถูกต้อง");
      sendTx(() => earn.setTreasury(a), "Earnings.setTreasury");
    });

    $("btnEarnWithdraw").addEventListener("click", () => {
      const amt = parseU($("inpEarnWithdraw").value, usdtDec);
      if (amt <= 0n) return alert("amount > 0");
      sendTx(() => earn.ownerWithdrawUSDTExcess(amt), "Earnings.withdrawUSDTExcess");
    });

    // Referral
    $("btnRefSetEarn").addEventListener("click", () => {
      const a = $("inpRefEarn").value.trim();
      if (!ethers.isAddress(a)) return alert("earnings addr ไม่ถูกต้อง");
      sendTx(() => ref.setEarn(a), "Referral.setEarn");
    });

    $("btnRefSetVault").addEventListener("click", () => {
      const a = $("inpRefVault").value.trim();
      if (!ethers.isAddress(a)) return alert("vault addr ไม่ถูกต้อง");
      sendTx(() => ref.setVault(a), "Referral.setVault");
    });

    // Binary
    $("btnBinSetEarn").addEventListener("click", () => {
      const a = $("inpBinEarn").value.trim();
      if (!ethers.isAddress(a)) return alert("earnings addr ไม่ถูกต้อง");
      sendTx(() => bin.setEarn(a), "Binary.setEarn");
    });

    $("btnBinSetRef").addEventListener("click", () => {
      const a = $("inpBinRef").value.trim();
      if (!ethers.isAddress(a)) return alert("referral addr ไม่ถูกต้อง");
      sendTx(() => bin.setReferral(a), "Binary.setReferral");
    });

    $("btnBinSetVault").addEventListener("click", () => {
      const a = $("inpBinVault").value.trim();
      if (!ethers.isAddress(a)) return alert("vault addr ไม่ถูกต้อง");
      sendTx(() => bin.setVault(a), "Binary.setVault");
    });
  }

  function boot() {
    fillStatics();
    bindUI();
    setStatus("Ready. Connect Owner wallet.");
  }

  boot();
})();
