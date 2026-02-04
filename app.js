(() => {
  "use strict";

  const C = window.APP_CONFIG;

  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);
  const setStatus = (msg) => { const el = $("status"); if (el) el.textContent = msg; };

  const shortAddr = (a) => a ? (a.slice(0, 6) + "..." + a.slice(-4)) : "-";
  const toLink = (addr) => `${C.BLOCK_EXPLORER}/address/${addr}`;
  const txLink = (hash) => `${C.BLOCK_EXPLORER}/tx/${hash}`;

  const fmtUnits = (v, dec=18, p=6) => {
    try{
      const s = ethers.formatUnits(v, dec);
      const [i, f=""] = s.split(".");
      return f.length ? `${i}.${f.slice(0,p)}` : i;
    }catch{ return "-"; }
  };

  const parseUnitsSafe = (txt, dec=18) => {
    const t = String(txt || "").trim();
    if (!t) return 0n;
    return ethers.parseUnits(t, dec);
  };

  // ---------- state ----------
  let provider = null;
  let signer = null;
  let user = null;

  let usdt = null;
  let core = null;
  let vault = null;
  let earn = null;
  let ref = null;
  let bin = null;

  let usdtDec = 18;

  // ---------- init static links ----------
  function fillStaticLinks() {
    $("ownerLink").href = toLink(C.OWNER_TREASURY);
    $("ownerLink").textContent = shortAddr(C.OWNER_TREASURY);

    $("coreLink").href = toLink(C.CONTRACTS.CORE);
    $("coreLink").textContent = shortAddr(C.CONTRACTS.CORE);

    $("vaultLink").href = toLink(C.CONTRACTS.VAULT365);
    $("vaultLink").textContent = shortAddr(C.CONTRACTS.VAULT365);

    $("earnLink").href = toLink(C.CONTRACTS.EARNINGS);
    $("earnLink").textContent = shortAddr(C.CONTRACTS.EARNINGS);

    $("refLink").href = toLink(C.CONTRACTS.REFERRAL);
    $("refLink").textContent = shortAddr(C.CONTRACTS.REFERRAL);

    $("binLink").href = toLink(C.CONTRACTS.BINARY);
    $("binLink").textContent = shortAddr(C.CONTRACTS.BINARY);

    // your ref link
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    $("refLinkInput").value = url.toString(); // updated after connect
  }

  // ---------- provider ----------
  async function ensureBSC() {
    const net = await provider.getNetwork();
    const chainId = Number(net.chainId);
    $("netText").textContent = `${net.name} (${chainId})`;
    if (chainId === C.CHAIN_ID_DEC) return true;

    setStatus("Switching network to BSC...");
    try{
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: C.CHAIN_ID_HEX }]
      });
      return true;
    }catch (e){
      // If chain not added
      if (e && (e.code === 4902 || String(e.message||"").includes("Unrecognized chain"))) {
        try{
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: C.CHAIN_ID_HEX,
              chainName: C.CHAIN_NAME,
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              rpcUrls: ["https://bsc-dataseed.binance.org/"],
              blockExplorerUrls: [C.BLOCK_EXPLORER],
            }]
          });
          return true;
        }catch(err){
          setStatus("❌ Cannot add/switch chain. Please switch to BSC manually.");
          return false;
        }
      }
      setStatus("❌ Please switch to BSC Mainnet manually.");
      return false;
    }
  }

  function bindContracts() {
    usdt = new ethers.Contract(C.TOKENS.USDT, C.ABI_ERC20, signer);

    core  = new ethers.Contract(C.CONTRACTS.CORE,     C.ABI.CORE,     signer);
    vault = new ethers.Contract(C.CONTRACTS.VAULT365, C.ABI.VAULT365, signer);
    earn  = new ethers.Contract(C.CONTRACTS.EARNINGS, C.ABI.EARNINGS, signer);
    ref   = new ethers.Contract(C.CONTRACTS.REFERRAL, C.ABI.REFERRAL, signer);
    bin   = new ethers.Contract(C.CONTRACTS.BINARY,   C.ABI.BINARY,   signer);
  }

  // ---------- connect ----------
  async function connect() {
    if (!window.ethereum) {
      alert("ไม่พบ Wallet (MetaMask/Bitget). โปรดติดตั้งหรือเปิดใน Browser ของกระเป๋า");
      return;
    }
    provider = new ethers.BrowserProvider(window.ethereum);

    // request accounts
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    user = await signer.getAddress();

    const ok = await ensureBSC();
    if (!ok) return;

    bindContracts();

    // decimals
    try { usdtDec = Number(await usdt.decimals()); } catch { usdtDec = 18; }

    $("walletText").innerHTML = `<a href="${toLink(user)}" target="_blank" rel="noreferrer">${shortAddr(user)}</a>`;
    const url = new URL(window.location.href);
    url.searchParams.set("ref", user);
    $("refLinkInput").value = url.toString();

    setStatus("✅ Connected.");
    await refreshAll();
  }

  // ---------- referral ----------
  async function loadRef() {
    try{
      const [r, set] = await ref.refOf(user);
      $("curRef").textContent = set ? r : "-";
    }catch{
      $("curRef").textContent = "-";
    }
  }

  async function setReferrer() {
    const r = $("refInput").value.trim();
    if (!ethers.isAddress(r)) return alert("Referrer address ไม่ถูกต้อง");
    if (r.toLowerCase() === user.toLowerCase()) return alert("ห้ามตั้ง ref เป็นตัวเอง");
    setStatus("⏳ Setting referrer...");
    try{
      const tx = await ref.setReferrer(r);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Referrer set. ${tx.hash}`);
      await loadRef();
    }catch(e){
      setStatus("❌ setReferrer failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- approve ----------
  async function approveAmount(usdtAmountHuman) {
    const amt = ethers.parseUnits(String(usdtAmountHuman), usdtDec);
    setStatus("⏳ Approving USDT...");
    try{
      const tx = await usdt.approve(C.CONTRACTS.CORE, amt);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus("✅ Approved.");
    }catch(e){
      setStatus("❌ approve failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  async function approveMax() {
    setStatus("⏳ Approving USDT (MAX)...");
    try{
      const max = (2n**256n) - 1n;
      const tx = await usdt.approve(C.CONTRACTS.CORE, max);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus("✅ Approved MAX.");
    }catch(e){
      setStatus("❌ approve MAX failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- buy ----------
  async function buy(pkgId) {
    setStatus(`⏳ Buying package ${pkgId}...`);
    try{
      const tx = await core.buy(pkgId);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Bought package ${pkgId}. ${tx.hash}`);
      await refreshAll();
    }catch(e){
      setStatus("❌ buy failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- earnings ----------
  const rankName = (r) => {
    if (r === 0) return "None";
    if (r === 1) return "Bronze";
    if (r === 2) return "Silver";
    if (r === 3) return "Gold";
    return String(r);
  };

  async function loadEarnings() {
    try{
      const u = await earn.users(user);
      // u: [rank, active, cap, accrued, claimed, overflowPending, overflowStart, inactivePending, inactiveStart]
      const r = Number(u[0]);
      const active = Boolean(u[1]);

      $("rankText").textContent = rankName(r);
      $("activeText").textContent = active ? "YES" : "NO";
      $("accruedText").textContent = fmtUnits(u[3], usdtDec, 6) + " USDT";
      $("claimedText").textContent = fmtUnits(u[4], usdtDec, 6) + " USDT";

      // remainingCap() helper exists
      const rem = await earn.remainingCap(user);
      $("capRemainText").textContent = fmtUnits(rem, usdtDec, 6) + " USDT";

      $("overflowText").textContent = fmtUnits(u[5], usdtDec, 6) + " USDT";
      $("inactiveText").textContent = fmtUnits(u[7], usdtDec, 6) + " USDT";
    }catch(e){
      $("rankText").textContent = "-";
      $("activeText").textContent = "-";
      $("capRemainText").textContent = "-";
      $("accruedText").textContent = "-";
      $("claimedText").textContent = "-";
      $("overflowText").textContent = "-";
      $("inactiveText").textContent = "-";
    }
  }

  async function claimUSDT() {
    const amtTxt = $("claimUsdtInput").value.trim();
    if (!amtTxt) return alert("กรอกจำนวน USDT ที่ต้องการเคลม");
    const amt = parseUnitsSafe(amtTxt, usdtDec);
    if (amt <= 0n) return alert("จำนวนไม่ถูกต้อง");

    setStatus("⏳ Claiming USDT...");
    try{
      const tx = await earn.claimUSDT(amt);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Claimed USDT. ${tx.hash}`);
      await loadEarnings();
    }catch(e){
      setStatus("❌ claimUSDT failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- stakes ----------
  function secToDHMS(sec) {
    sec = Number(sec);
    if (sec <= 0) return "0s";
    const d = Math.floor(sec / 86400);
    sec %= 86400;
    const h = Math.floor(sec / 3600);
    sec %= 3600;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const parts = [];
    if (d) parts.push(d + "d");
    if (h) parts.push(h + "h");
    if (m) parts.push(m + "m");
    parts.push(s + "s");
    return parts.join(" ");
  }

  async function loadStakes() {
    const wrap = $("stakesWrap");
    wrap.innerHTML = "";

    let n = 0;
    try{ n = Number(await vault.stakeCount(user)); }catch{ n = 0; }

    if (!n) {
      wrap.innerHTML = `<div class="muted">ยังไม่มี stake</div>`;
      return;
    }

    for (let i = 0; i < n; i++) {
      const s = await vault.stakes(user, i);
      // s: thbcIn, principal, dailyBP, startTs, endTs, totalReward, claimed
      const thbcIn = s[0], principal = s[1], dailyBP = s[2], startTs = s[3], endTs = s[4], totalReward = s[5], claimed = s[6];

      const left = await vault.secondsLeft(user, i);
      const accrued = await vault.rewardAccruedNow(user, i);
      const payout = await vault.totalPayoutAtMaturity(user, i);
      const canClaim = await vault.claimable(user, i);

      const dailyPct = (Number(dailyBP) / 100).toFixed(2) + "%/day";

      const div = document.createElement("div");
      div.className = "stake";
      div.innerHTML = `
        <div class="stakeHead">
          <div>
            <div class="badge">Stake #${i}</div>
            <div class="muted">THBC In: <span class="mono">${fmtUnits(thbcIn, 18, 4)}</span> • Daily: <b>${dailyPct}</b></div>
          </div>
          <div class="right">
            <div class="badge">${claimed ? "CLAIMED" : (canClaim ? "MATURED" : "LOCKED")}</div>
            <div class="muted">Time Left: <span class="mono" data-left="${left}">${secToDHMS(left)}</span></div>
          </div>
        </div>

        <div class="row" style="margin-top:10px">
          <div>
            <div class="label">Principal (NUTTY)</div>
            <div class="mono">${fmtUnits(principal, 18, 6)}</div>
          </div>
          <div>
            <div class="label">Accrued Today</div>
            <div class="mono">${fmtUnits(accrued, 18, 6)} NUTTY</div>
          </div>
          <div>
            <div class="label">Total Reward</div>
            <div class="mono">${fmtUnits(totalReward, 18, 6)} NUTTY</div>
          </div>
          <div>
            <div class="label">Payout at Maturity</div>
            <div class="mono">${fmtUnits(payout, 18, 6)} NUTTY</div>
          </div>
        </div>

        <div class="row" style="margin-top:12px">
          <button class="btn primary" ${canClaim && !claimed ? "" : "disabled"} data-claim="${i}">
            Claim NUTTY
          </button>
          <a class="muted" href="${toLink(C.CONTRACTS.VAULT365)}" target="_blank" rel="noreferrer">View Vault</a>
        </div>
      `;

      // claim handler
      div.querySelector(`[data-claim="${i}"]`)?.addEventListener("click", () => claimNutty(i));
      wrap.appendChild(div);
    }
  }

  async function claimNutty(index) {
    setStatus(`⏳ Claiming NUTTY stake #${index}...`);
    try{
      const tx = await vault.claim(index);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Claimed NUTTY. ${tx.hash}`);
      await loadStakes();
    }catch(e){
      setStatus("❌ claim NUTTY failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- binary ----------
  async function loadBinary() {
    try{
      const b = await bin.b(user);
      $("leftVol").textContent = fmtUnits(b[3], usdtDec, 6) + " USDT";
      $("rightVol").textContent = fmtUnits(b[4], usdtDec, 6) + " USDT";
      $("paidWeak").textContent = fmtUnits(b[5], usdtDec, 6) + " USDT";
    }catch{
      $("leftVol").textContent = "-";
      $("rightVol").textContent = "-";
      $("paidWeak").textContent = "-";
    }
  }

  async function setBinaryPlacement() {
    const up = $("binUpline").value.trim();
    if (!ethers.isAddress(up)) return alert("Upline (binary) address ไม่ถูกต้อง");
    if (up.toLowerCase() === user.toLowerCase()) return alert("ห้ามตั้ง upline เป็นตัวเอง");
    const side = $("binSide").value;
    const right = (side === "right");

    setStatus("⏳ Setting binary placement...");
    try{
      const tx = await bin.setBinaryPlacement(up, right);
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus("✅ Binary placement set.");
      await loadBinary();
    }catch(e){
      setStatus("❌ setBinaryPlacement failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  async function claimBinary() {
    setStatus("⏳ Claiming binary...");
    try{
      const tx = await bin.claimBinary();
      setStatus(`⏳ TX sent: ${tx.hash}`);
      await tx.wait();
      setStatus("✅ Claimed binary.");
      await loadEarnings();
      await loadBinary();
    }catch(e){
      setStatus("❌ claimBinary failed: " + (e?.shortMessage || e?.message || e));
    }
  }

  // ---------- refresh ----------
  async function refreshAll() {
    if (!user) return;
    await Promise.allSettled([loadRef(), loadEarnings(), loadBinary(), loadStakes()]);
  }

  // ---------- URL ref prefill ----------
  function prefillRefFromURL() {
    try{
      const u = new URL(window.location.href);
      const r = u.searchParams.get("ref");
      if (r && ethers.isAddress(r)) $("refInput").value = r;
    }catch{}
  }

  // ---------- bind UI ----------
  function bindUI() {
    $("btnConnect").addEventListener("click", connect);
    $("btnSetRef").addEventListener("click", setReferrer);

    $("btnCopyRef").addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText($("refLinkInput").value);
        setStatus("✅ Copied ref link.");
      }catch{
        setStatus("❌ Copy failed.");
      }
    });

    $("btnApprove100").addEventListener("click", () => approveAmount("100"));
    $("btnApprove500").addEventListener("click", () => approveAmount("500"));
    $("btnApprove1000").addEventListener("click", () => approveAmount("1000"));
    $("btnApproveMax").addEventListener("click", approveMax);

    $("btnBuy0").addEventListener("click", () => buy(0));
    $("btnBuy1").addEventListener("click", () => buy(1));
    $("btnBuy2").addEventListener("click", () => buy(2));

    $("btnClaimUSDT").addEventListener("click", claimUSDT);

    $("btnSetBinary").addEventListener("click", setBinaryPlacement);
    $("btnClaimBinary").addEventListener("click", claimBinary);

    $("btnRefresh").addEventListener("click", refreshAll);
  }

  // ---------- boot ----------
  function boot() {
    fillStaticLinks();
    bindUI();
    prefillRefFromURL();
    setStatus("Ready. Click Connect Wallet.");
  }

  boot();
})();
