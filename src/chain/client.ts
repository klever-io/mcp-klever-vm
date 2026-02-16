/**
 * Klever Blockchain HTTP Client
 *
 * Provides methods for querying the Klever blockchain via Node API and API Proxy.
 * Uses native fetch (Node 18+) — no external HTTP dependencies.
 */

import {
  ContractType,
  SCType,
} from './types.js';
import type {
  KleverNetwork,
  NetworkConfig,
  KleverResponse,
  AccountData,
  BalanceData,
  AssetData,
  KDAData,
  VMQueryRequest,
  VMQueryData,
  TransactionData,
  BlockData,
  ValidatorData,
  NodeStatusData,
  TransactionBuildRequest,
  TransactionBuildData,
  TransferParams,
  DeployParams,
  InvokeParams,
  FreezeParams,
} from './types.js';

/** Network URL mapping */
const NETWORK_CONFIGS: Record<KleverNetwork, NetworkConfig> = {
  mainnet: {
    nodeUrl: 'https://node.mainnet.klever.org',
    apiUrl: 'https://api.mainnet.klever.org',
  },
  testnet: {
    nodeUrl: 'https://node.testnet.klever.org',
    apiUrl: 'https://api.testnet.klever.org',
  },
  devnet: {
    nodeUrl: 'https://node.devnet.klever.org',
    apiUrl: 'https://api.devnet.klever.org',
  },
  local: {
    nodeUrl: 'http://localhost:8080',
    apiUrl: 'http://localhost:9090',
  },
};

export interface ChainClientOptions {
  /** Default network (can be overridden per-call) */
  network?: KleverNetwork;
  /** Request timeout in milliseconds (default: 15000) */
  timeout?: number;
  /** Custom node URL (overrides network-based URL) */
  nodeUrl?: string;
  /** Custom API URL (overrides network-based URL) */
  apiUrl?: string;
}

export class KleverChainClient {
  private defaultNetwork: KleverNetwork;
  private timeout: number;
  private customNodeUrl?: string;
  private customApiUrl?: string;

  constructor(options: ChainClientOptions = {}) {
    this.defaultNetwork = options.network || 'mainnet';
    this.timeout = options.timeout || 15000;
    this.customNodeUrl = options.nodeUrl;
    this.customApiUrl = options.apiUrl;
  }

  /** Get the configured default network */
  getDefaultNetwork(): KleverNetwork {
    return this.defaultNetwork;
  }

  /** Resolve node URL for a given network */
  getNodeUrl(network?: KleverNetwork): string {
    if (this.customNodeUrl) return this.customNodeUrl;
    return NETWORK_CONFIGS[network || this.defaultNetwork].nodeUrl;
  }

  /** Resolve API proxy URL for a given network */
  getApiUrl(network?: KleverNetwork): string {
    if (this.customApiUrl) return this.customApiUrl;
    return NETWORK_CONFIGS[network || this.defaultNetwork].apiUrl;
  }

  // ─── Core HTTP Methods ───────────────────────────────────

  private async fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.timeout}ms: ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      headers: { Accept: 'application/json' },
    });
    return (await response.json()) as T;
  }

  private async postJson<T>(url: string, body: unknown): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  }

  /** Unwrap a Klever API response, throwing on error */
  private unwrap<T>(response: KleverResponse<T>, context: string): T {
    if (response.code !== 'successful' || response.error) {
      throw new Error(`${context}: ${response.error || `code=${response.code}`}`);
    }
    return response.data;
  }

  // ─── Account Operations ──────────────────────────────────

  /** Get full account details */
  async getAccount(
    address: string,
    network?: KleverNetwork
  ): Promise<AccountData> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.fetchJson<KleverResponse<{ account: AccountData }>>(
      `${nodeUrl}/address/${address}`
    );
    return this.unwrap(response, `getAccount(${address})`).account;
  }

  /** Get KLV balance for an address */
  async getBalance(
    address: string,
    assetId?: string,
    network?: KleverNetwork
  ): Promise<number> {
    const nodeUrl = this.getNodeUrl(network);
    const url = assetId
      ? `${nodeUrl}/address/${address}/balance?asset=${encodeURIComponent(assetId)}`
      : `${nodeUrl}/address/${address}/balance`;

    const response = await this.fetchJson<KleverResponse<BalanceData>>(url);
    return this.unwrap(response, `getBalance(${address})`).balance;
  }

  /** Get detailed KDA token info (includes staking data) */
  async getKDAInfo(
    address: string,
    assetId: string,
    network?: KleverNetwork
  ): Promise<KDAData> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.fetchJson<KleverResponse<KDAData>>(
      `${nodeUrl}/address/${address}/kda?asset=${encodeURIComponent(assetId)}`
    );
    return this.unwrap(response, `getKDAInfo(${address}, ${assetId})`);
  }

  /** Get current nonce for an address */
  async getNonce(
    address: string,
    network?: KleverNetwork
  ): Promise<number> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.fetchJson<KleverResponse<{ nonce: number }>>(
      `${nodeUrl}/address/${address}/nonce`
    );
    return this.unwrap(response, `getNonce(${address})`).nonce;
  }

  // ─── Asset Operations ────────────────────────────────────

  /** Get complete asset properties */
  async getAssetInfo(
    assetId: string,
    network?: KleverNetwork
  ): Promise<AssetData['asset']> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.fetchJson<KleverResponse<AssetData>>(
      `${nodeUrl}/asset/${encodeURIComponent(assetId)}`
    );
    const data = this.unwrap(response, `getAssetInfo(${assetId})`);
    return data.asset;
  }

  // ─── Smart Contract Operations ───────────────────────────

  /** Execute a read-only smart contract query */
  async querySmartContract(
    request: VMQueryRequest,
    network?: KleverNetwork
  ): Promise<VMQueryData> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.postJson<KleverResponse<VMQueryData>>(
      `${nodeUrl}/vm/query`,
      request
    );
    return this.unwrap(response, `querySmartContract(${request.scAddress}::${request.funcName})`);
  }

  // ─── Transaction Builder Methods ────────────────────────

  /** Build an unsigned transfer (KLV or KDA) transaction */
  async buildTransfer(
    params: TransferParams,
    network?: KleverNetwork
  ): Promise<TransactionBuildData> {
    const nonce = await this.getNonce(params.sender, network);

    const contracts: Array<Record<string, unknown>> = [
      {
        amount: params.amount,
        toAddress: params.receiver,
        ...(params.assetId ? { assetId: params.assetId } : {}),
      },
    ];

    return this.buildTransaction(
      { type: ContractType.Transfer, sender: params.sender, nonce, contracts },
      network
    );
  }

  /** Build an unsigned smart contract deploy transaction */
  async buildDeploy(
    params: DeployParams,
    network?: KleverNetwork
  ): Promise<TransactionBuildData> {
    const nonce = await this.getNonce(params.sender, network);

    const data = [params.wasmHex, ...(params.initArgs || [])];

    const contracts: Array<Record<string, unknown>> = [
      { scType: SCType.SCDeploy },
    ];

    return this.buildTransaction(
      { type: ContractType.SmartContract, sender: params.sender, nonce, contracts, data },
      network
    );
  }

  /** Build an unsigned smart contract invoke transaction */
  async buildInvoke(
    params: InvokeParams,
    network?: KleverNetwork
  ): Promise<TransactionBuildData> {
    const nonce = await this.getNonce(params.sender, network);

    const data = [params.funcName, ...(params.args || [])];

    const contracts: Array<Record<string, unknown>> = [
      {
        scType: SCType.SCInvoke,
        address: params.scAddress,
        ...(params.callValue ? { callValue: params.callValue } : {}),
      },
    ];

    return this.buildTransaction(
      { type: ContractType.SmartContract, sender: params.sender, nonce, contracts, data },
      network
    );
  }

  /** Build an unsigned freeze KLV transaction */
  async buildFreeze(
    params: FreezeParams,
    network?: KleverNetwork
  ): Promise<TransactionBuildData> {
    const nonce = await this.getNonce(params.sender, network);

    const contracts: Array<Record<string, unknown>> = [
      { amount: params.amount },
    ];

    return this.buildTransaction(
      { type: ContractType.Freeze, sender: params.sender, nonce, contracts },
      network
    );
  }

  // ─── Transaction Operations ──────────────────────────────

  /** Get transaction details by hash (from node) */
  async getTransaction(
    hash: string,
    network?: KleverNetwork
  ): Promise<TransactionData> {
    const apiUrl = this.getApiUrl(network);
    // Use API proxy for indexed transaction data (more complete)
    const response = await this.fetchJson<{
      data: { transaction: TransactionData };
      error: string;
      code: string;
    }>(`${apiUrl}/v1.0/transaction/${hash}`);

    if (response.error) {
      throw new Error(`getTransaction(${hash}): ${response.error}`);
    }
    return response.data.transaction;
  }

  /** Build an unsigned transaction */
  async buildTransaction(
    request: TransactionBuildRequest,
    network?: KleverNetwork
  ): Promise<TransactionBuildData> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.postJson<KleverResponse<TransactionBuildData>>(
      `${nodeUrl}/transaction/send`,
      request
    );
    return this.unwrap(response, 'buildTransaction');
  }

  // ─── Block Operations ────────────────────────────────────

  /** Get block by nonce (number) */
  async getBlock(
    nonce?: number,
    network?: KleverNetwork
  ): Promise<BlockData> {
    const apiUrl = this.getApiUrl(network);

    if (nonce !== undefined) {
      const response = await this.fetchJson<{
        data: { block: BlockData };
        error: string;
      }>(`${apiUrl}/v1.0/block/by-nonce/${nonce}`);
      if (response.error) {
        throw new Error(`getBlock(${nonce}): ${response.error}`);
      }
      return response.data.block;
    }

    // No nonce = latest block
    const response = await this.fetchJson<{
      data: { blocks: BlockData[] };
      error: string;
    }>(`${apiUrl}/v1.0/block/list?limit=1`);
    if (response.error) {
      throw new Error(`getBlock(latest): ${response.error}`);
    }
    if (!response.data.blocks || response.data.blocks.length === 0) {
      throw new Error('getBlock(latest): No blocks returned');
    }
    return response.data.blocks[0];
  }

  // ─── Network Operations ──────────────────────────────────

  /** List active validators */
  async listValidators(
    network?: KleverNetwork
  ): Promise<ValidatorData[]> {
    const apiUrl = this.getApiUrl(network);
    const response = await this.fetchJson<{
      data: { validators: ValidatorData[] };
      error: string;
    }>(`${apiUrl}/v1.0/validators`);

    if (response.error) {
      throw new Error(`listValidators: ${response.error}`);
    }
    return response.data.validators || [];
  }

  /** Get node status */
  async getNodeStatus(network?: KleverNetwork): Promise<NodeStatusData> {
    const nodeUrl = this.getNodeUrl(network);
    const response = await this.fetchJson<KleverResponse<NodeStatusData>>(
      `${nodeUrl}/node/status`
    );
    return this.unwrap(response, 'getNodeStatus');
  }
}

export { NETWORK_CONFIGS };
