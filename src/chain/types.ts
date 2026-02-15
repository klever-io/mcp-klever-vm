/**
 * Types for Klever blockchain API responses
 */

/** Supported network environments */
export type KleverNetwork = 'mainnet' | 'testnet' | 'devnet' | 'local';

/** Network URL configuration */
export interface NetworkConfig {
  nodeUrl: string;
  apiUrl: string;
}

/** Standard Klever API response wrapper */
export interface KleverResponse<T> {
  data: T;
  error: string;
  code: string;
}

/** Account data from GET /address/{address} */
export interface AccountData {
  address: string;
  nonce: number;
  balance: number;
  frozenBalance: number;
  allowance: number;
  permissions: string[];
  timestamp: number;
  rootHash?: string;
  assets?: Record<string, AssetBalance>;
}

/** Asset balance within an account */
export interface AssetBalance {
  assetId: string;
  balance: number;
  frozenBalance?: number;
  unfrozenBalance?: number;
  lastClaim?: Record<string, unknown>;
}

/** Balance response from GET /address/{address}/balance */
export interface BalanceData {
  balance: number;
}

/** Nonce response from GET /address/{address}/nonce */
export interface NonceData {
  nonce: number;
}

/** Asset properties from GET /asset/{assetID} */
export interface AssetData {
  asset: {
    ID: string;
    Name: string;
    Ticker: string;
    Logo?: string;
    URIs?: Record<string, string>;
    OwnerAddress: string;
    AdminAddress?: string;
    Precision: number;
    InitialSupply: number;
    CirculatingSupply: number;
    MaxSupply?: number;
    MintedValue: number;
    BurnedValue?: number;
    IssueDate: number;
    Royalties?: {
      Address: string;
      TransferPercentage?: number[];
      MarketPercentage?: number;
      MarketFixedAmount?: number;
    };
    Properties: {
      CanFreeze?: boolean;
      CanWipe?: boolean;
      CanPause?: boolean;
      CanMint?: boolean;
      CanBurn?: boolean;
      CanChangeOwner?: boolean;
      CanAddRoles?: boolean;
    };
    Attributes?: Record<string, boolean>;
    Roles?: Array<{
      Address: string;
      HasRoleMint?: boolean;
      HasRoleSetITOPrices?: boolean;
      HasRoleDeposit?: boolean;
      HasRoleTransfer?: boolean;
    }>;
  };
}

/** KDA token info from GET /address/{address}/kda?asset={KDA-ID} */
export interface KDAData {
  address: string;
  asset: string;
  userKDA: {
    LastClaim?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

/** VM query request body */
export interface VMQueryRequest {
  scAddress: string;
  funcName: string;
  args?: string[];
}

/** VM query response from POST /vm/query */
export interface VMQueryData {
  returnData?: string[];
  returnCode?: string;
  returnMessage?: string;
  gasUsed?: number;
}

/** Transaction data from GET /transaction/{hash} */
export interface TransactionData {
  hash: string;
  sender: string;
  receiver?: string;
  nonce?: number;
  status?: string;
  resultCode?: string;
  blockNum?: number;
  blockHash?: string;
  timestamp?: number;
  contract?: Array<{
    type: number;
    parameter: Record<string, unknown>;
  }>;
  receipts?: Array<{
    type: number;
    data?: Record<string, unknown>;
  }>;
  [key: string]: unknown;
}

/** Block data from GET /block/by-nonce/{nonce} */
export interface BlockData {
  hash: string;
  nonce: number;
  timestamp: number;
  prevHash?: string;
  proposer?: string;
  numTxs?: number;
  size?: number;
  epoch?: number;
  [key: string]: unknown;
}

/** Validator info from GET /validators or /v1.0/validators */
export interface ValidatorData {
  ownerAddress: string;
  name?: string;
  canDelegate?: boolean;
  commission?: number;
  maxDelegation?: number;
  totalStaked?: number;
  selfStaked?: number;
  rating?: number;
  [key: string]: unknown;
}

/** Node status from GET /node/status */
export interface NodeStatusData {
  isRunning: boolean;
  isSynced: boolean;
  currentNonce: number;
  currentBlockHash: string;
  appVersion: string;
  [key: string]: unknown;
}

/** Transaction build request for POST /transaction/send */
export interface TransactionBuildRequest {
  type: number;
  sender: string;
  nonce: number;
  contract: Array<{
    type: number;
    parameter: Record<string, unknown>;
  }>;
  data?: string[];
  kdaFee?: {
    kda: string;
    amount: number;
  };
}

/** Transaction build response from POST /transaction/send */
export interface TransactionBuildData {
  result: {
    txHash: string;
    tx: string;
  };
}

/** Transaction broadcast response from POST /transactions/broadcast */
export interface TransactionBroadcastData {
  txHash: string;
}

/** API proxy transaction response (indexed data) */
export interface APITransactionData {
  data: {
    transaction: TransactionData;
  };
}

/** API proxy block list response */
export interface APIBlockListData {
  data: {
    blocks: BlockData[];
  };
  pagination?: {
    self: number;
    next: number;
    previous: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
}

/** API proxy validators response */
export interface APIValidatorsData {
  data: {
    validators: ValidatorData[];
  };
  pagination?: {
    self: number;
    next: number;
    previous: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
}
