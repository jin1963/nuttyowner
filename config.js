// config.js (FULL)
// THBC → NUTTY Vault365 • Pink/White DApp
// Network: BSC Mainnet (56)

window.APP_CONFIG = {
  CHAIN_ID_DEC: 56,
  CHAIN_ID_HEX: "0x38",
  CHAIN_NAME: "BSC Mainnet",
  RPC_URL: "https://bsc-dataseed.binance.org/",
  BLOCK_EXPLORER: "https://bscscan.com",

  OWNER_TREASURY: "0x42fFFc44dF2Bd6CFb2dC2F64612aFdbc36c13fA6",

  TOKENS: {
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    THBC: "0xe8d4687b77B5611eF1828FDa7428034FA12a1Beb",
    NUTTY: "0xBCa8ad2fdBcd279A7F3079c5C785ED107feCEBf9",
  },

  CONTRACTS: {
    VAULT365: "0x737B9b3EC556dFA6D5b94B5B0777Bea899dA40b5",
    CORE: "0x4595b025299372DC24FD4C3b403B6B0351EbfE55",
    EARNINGS: "0x62302eedcB0aD10232cb986Ec605fF57bdb1766f",
    REFERRAL: "0x2aA12602267Ed815394231B7a4E31BA23F135B7C",
    BINARY: "0x300f2E2a3894Fc98a760b7A7C093fF635A91ccbE",
  },

  // Minimal ERC20 ABI for approve/balance/allowance/decimals
  ABI_ERC20: [
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" },
    { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" },
    { "constant": true, "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" },
    { "constant": false, "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" },
  ],

  ABI: {
    // ===== VAULT365 (THBCNuttyVault365) =====
    VAULT365: [
      {
        "inputs": [
          { "internalType": "address", "name": "thbc_", "type": "address" },
          { "internalType": "address", "name": "nutty_", "type": "address" },
          { "internalType": "address", "name": "initialOwner", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
          { "indexed": true, "internalType": "uint256", "name": "index", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "paidNutty", "type": "uint256" }
        ],
        "name": "Claimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "address", "name": "oldCore", "type": "address" },
          { "indexed": false, "internalType": "address", "name": "newCore", "type": "address" }
        ],
        "name": "CoreChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "uint256", "name": "oldRate", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "newRate", "type": "uint256" }
        ],
        "name": "RateChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
          { "indexed": true, "internalType": "uint256", "name": "index", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "thbcIn", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "principalNutty", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "dailyBP", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "startTs", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "endTs", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "totalReward", "type": "uint256" }
        ],
        "name": "Staked",
        "type": "event"
      },
      { "inputs": [], "name": "NUTTY", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "THBC", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "claimable",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [], "name": "core", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "thbcAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "dailyBP", "type": "uint256" },
          { "internalType": "uint256", "name": "lockSeconds", "type": "uint256" }
        ],
        "name": "createStakeFromCore",
        "outputs": [{ "internalType": "uint256", "name": "idx", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "daysElapsed",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "daysTotal",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [], "name": "nuttyExcess", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ownerWithdrawNuttyExcess", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ownerWithdrawTHBC", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "reservedTotal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "rewardAccruedNow",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "secondsLeft",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [{ "internalType": "address", "name": "c", "type": "address" }], "name": "setCore", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "r", "type": "uint256" }], "name": "setRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "stakeCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "", "type": "address" },
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "stakes",
        "outputs": [
          { "internalType": "uint256", "name": "thbcIn", "type": "uint256" },
          { "internalType": "uint256", "name": "principal", "type": "uint256" },
          { "internalType": "uint256", "name": "dailyBP", "type": "uint256" },
          { "internalType": "uint256", "name": "startTs", "type": "uint256" },
          { "internalType": "uint256", "name": "endTs", "type": "uint256" },
          { "internalType": "uint256", "name": "totalReward", "type": "uint256" },
          { "internalType": "bool", "name": "claimed", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [], "name": "thbcToNuttyRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "totalPayoutAtMaturity",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ],

    // ===== CORE (THBCPackagesCore) =====
    CORE: [
      {
        "inputs": [
          { "internalType": "address", "name": "usdt_", "type": "address" },
          { "internalType": "address", "name": "thbc_", "type": "address" },
          { "internalType": "address", "name": "treasury_", "type": "address" },
          { "internalType": "address", "name": "initialOwner", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
          { "indexed": true, "internalType": "uint256", "name": "pkgId", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "usdtPaid", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "thbcToVault", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "stakeIndex", "type": "uint256" }
        ],
        "name": "Bought",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "uint256", "name": "oldBP", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "newBP", "type": "uint256" }
        ],
        "name": "CommissionPoolBPChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "address", "name": "oldE", "type": "address" },
          { "indexed": false, "internalType": "address", "name": "newE", "type": "address" }
        ],
        "name": "EarningsChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "PackageAdded", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "PackageUpdated", "type": "event" },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "address", "name": "oldT", "type": "address" },
          { "indexed": false, "internalType": "address", "name": "newT", "type": "address" }
        ],
        "name": "TreasuryChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "address", "name": "oldV", "type": "address" },
          { "indexed": false, "internalType": "address", "name": "newV", "type": "address" }
        ],
        "name": "VaultChanged",
        "type": "event"
      },
      { "inputs": [], "name": "THBC", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "USDT", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "usdtPrice", "type": "uint256" },
          { "internalType": "uint256", "name": "thbcAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "dailyBP", "type": "uint256" },
          { "internalType": "uint256", "name": "lockSeconds", "type": "uint256" }
        ],
        "name": "addPackage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      { "inputs": [{ "internalType": "uint256", "name": "pkgId", "type": "uint256" }], "name": "buy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "buyEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "commissionPoolBP", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "earnings", "outputs": [{ "internalType": "contract IEarnOnBuy", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ownerWithdrawTHBC", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ownerWithdrawUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "packageCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "packages",
        "outputs": [
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "usdtPrice", "type": "uint256" },
          { "internalType": "uint256", "name": "thbcAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "dailyBP", "type": "uint256" },
          { "internalType": "uint256", "name": "lockSeconds", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "pkgRank", "outputs": [{ "internalType": "enum IEarnOnBuy.Rank", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "bool", "name": "on", "type": "bool" }], "name": "setBuyEnabled", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "bp", "type": "uint256" }], "name": "setCommissionPoolBP", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "e", "type": "address" }], "name": "setEarnings", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "pkgId0to2", "type": "uint256" }, { "internalType": "enum IEarnOnBuy.Rank", "name": "r", "type": "uint8" }], "name": "setPkgRank", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "t", "type": "address" }], "name": "setTreasury", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "v", "type": "address" }], "name": "setVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "treasury", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "usdtPrice", "type": "uint256" },
          { "internalType": "uint256", "name": "thbcAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "dailyBP", "type": "uint256" },
          { "internalType": "uint256", "name": "lockSeconds", "type": "uint256" }
        ],
        "name": "updatePackage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      { "inputs": [], "name": "vault", "outputs": [{ "internalType": "contract IVaultTHBC", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
    ],

    // ===== EARNINGS (THBCMarketingEarnings) =====
    EARNINGS: [
      {
        "inputs": [
          { "internalType": "address", "name": "usdt_", "type": "address" },
          { "internalType": "address", "name": "treasury_", "type": "address" },
          { "internalType": "address", "name": "initialOwner", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
        ],
        "name": "Accrued",
        "type": "event"
      },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Claimed", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "c", "type": "address" }], "name": "CoreSet", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "start", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "expiresAt", "type": "uint256" }], "name": "InactivePendingAdded", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "InactiveSwept", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "ref", "type": "address" }, { "indexed": false, "internalType": "address", "name": "bin", "type": "address" }], "name": "ModulesSet", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "start", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "expiresAt", "type": "uint256" }], "name": "OverflowAdded", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "OverflowSwept", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "t", "type": "address" }], "name": "TreasurySet", "type": "event" },
      { "inputs": [], "name": "USDT", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "WINDOW_90D", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "string", "name": "reason", "type": "string" }], "name": "accrueUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "binaryModule", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "enum THBCMarketingEarnings.Rank", "name": "r", "type": "uint8" }], "name": "capByRank", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "claimUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "globalAccrued", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "usdtPaid", "type": "uint256" }, { "internalType": "enum THBCMarketingEarnings.Rank", "name": "newRank", "type": "uint8" }], "name": "onPackageBuy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ownerWithdrawUSDTExcess", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "packagesCore", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "referralModule", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "u", "type": "address" }], "name": "remainingCap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }, { "internalType": "address", "name": "bin", "type": "address" }], "name": "setModules", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "c", "type": "address" }], "name": "setPackagesCore", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "t", "type": "address" }], "name": "setTreasury", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "treasury", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "users",
        "outputs": [
          { "internalType": "enum THBCMarketingEarnings.Rank", "name": "rank", "type": "uint8" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "cap", "type": "uint256" },
          { "internalType": "uint256", "name": "accrued", "type": "uint256" },
          { "internalType": "uint256", "name": "claimed", "type": "uint256" },
          { "internalType": "uint256", "name": "overflowPending", "type": "uint256" },
          { "internalType": "uint256", "name": "overflowStart", "type": "uint256" },
          { "internalType": "uint256", "name": "inactivePending", "type": "uint256" },
          { "internalType": "uint256", "name": "inactiveStart", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],

    // ===== REFERRAL (ReferralMatching) =====
    REFERRAL: [
      { "inputs": [{ "internalType": "address", "name": "initialOwner", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
      { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
      { "inputs": [], "name": "MATCH_BP", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "MATCH_LEVELS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "earn", "outputs": [{ "internalType": "contract IEarn", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "usdtAmount", "type": "uint256" }], "name": "onBuy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "downline", "type": "address" }, { "internalType": "uint256", "name": "claimedAmount", "type": "uint256" }], "name": "onClaim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "refOf",
        "outputs": [
          { "internalType": "address", "name": "ref", "type": "address" },
          { "internalType": "bool", "name": "set", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "e", "type": "address" }], "name": "setEarn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }], "name": "setReferrer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "v", "type": "address" }], "name": "setVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "vault", "outputs": [{ "internalType": "contract IVaultActive", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
    ],

    // ===== BINARY (BinaryWeakLeg) =====
    BINARY: [
      { "inputs": [{ "internalType": "address", "name": "initialOwner", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
      { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
      { "inputs": [], "name": "BINARY_BP", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "b",
        "outputs": [
          { "internalType": "address", "name": "upline", "type": "address" },
          { "internalType": "bool", "name": "right", "type": "bool" },
          { "internalType": "bool", "name": "set", "type": "bool" },
          { "internalType": "uint256", "name": "leftVol", "type": "uint256" },
          { "internalType": "uint256", "name": "rightVol", "type": "uint256" },
          { "internalType": "uint256", "name": "paidWeak", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      { "inputs": [], "name": "claimBinary", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "earn", "outputs": [{ "internalType": "contract IEarn2", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "usdtAmount", "type": "uint256" }], "name": "onBuy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "referral", "outputs": [{ "internalType": "contract IRefMap", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "up", "type": "address" }, { "internalType": "bool", "name": "rightSide", "type": "bool" }], "name": "setBinaryPlacement", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "e", "type": "address" }], "name": "setEarn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "r", "type": "address" }], "name": "setReferral", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "v", "type": "address" }], "name": "setVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "vault", "outputs": [{ "internalType": "contract IVaultActive2", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
    ]
  }
};
