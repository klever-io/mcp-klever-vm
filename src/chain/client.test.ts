import { jest } from '@jest/globals';
import { KleverChainClient, NETWORK_CONFIGS } from './client.js';

// Mock global fetch (save original and restore in afterAll)
const originalFetch = global.fetch;
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch;

afterAll(() => {
  global.fetch = originalFetch;
});

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: () => jsonResponse(data, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    bytes: () => Promise.resolve(new Uint8Array()),
  };
}

describe('KleverChainClient', () => {
  let client: KleverChainClient;

  beforeEach(() => {
    mockFetch.mockClear();
    client = new KleverChainClient({ network: 'testnet', timeout: 5000 });
  });

  describe('constructor and configuration', () => {
    it('uses default mainnet when no network specified', () => {
      const defaultClient = new KleverChainClient();
      expect(defaultClient.getDefaultNetwork()).toBe('mainnet');
      expect(defaultClient.getNodeUrl()).toBe(NETWORK_CONFIGS.mainnet.nodeUrl);
      expect(defaultClient.getApiUrl()).toBe(NETWORK_CONFIGS.mainnet.apiUrl);
    });

    it('uses specified network', () => {
      expect(client.getDefaultNetwork()).toBe('testnet');
      expect(client.getNodeUrl()).toBe('https://node.testnet.klever.org');
      expect(client.getApiUrl()).toBe('https://api.testnet.klever.org');
    });

    it('allows per-call network override', () => {
      expect(client.getNodeUrl('devnet')).toBe('https://node.devnet.klever.org');
      expect(client.getApiUrl('devnet')).toBe('https://api.devnet.klever.org');
    });

    it('uses custom URLs when provided', () => {
      const customClient = new KleverChainClient({
        nodeUrl: 'http://custom-node:8080',
        apiUrl: 'http://custom-api:9090',
      });
      expect(customClient.getNodeUrl()).toBe('http://custom-node:8080');
      expect(customClient.getApiUrl()).toBe('http://custom-api:9090');
      // Custom URLs ignore network override
      expect(customClient.getNodeUrl('devnet')).toBe('http://custom-node:8080');
    });

    it('uses local network URLs', () => {
      const localClient = new KleverChainClient({ network: 'local' });
      expect(localClient.getNodeUrl()).toBe('http://localhost:8080');
      expect(localClient.getApiUrl()).toBe('http://localhost:9090');
    });
  });

  describe('getBalance', () => {
    it('fetches KLV balance', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { balance: 5000000 }, error: '', code: 'successful' })
      );

      const balance = await client.getBalance('klv1test');
      expect(balance).toBe(5000000);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.testnet.klever.org/address/klv1test/balance',
        expect.objectContaining({ headers: { Accept: 'application/json' } })
      );
    });

    it('fetches KDA token balance', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { balance: 99999000 }, error: '', code: 'successful' })
      );

      const balance = await client.getBalance('klv1test', 'LPKLVKFI-3I0N');
      expect(balance).toBe(99999000);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.testnet.klever.org/address/klv1test/balance?asset=LPKLVKFI-3I0N',
        expect.anything()
      );
    });

    it('uses network override', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { balance: 100 }, error: '', code: 'successful' })
      );

      await client.getBalance('klv1test', undefined, 'mainnet');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.mainnet.klever.org/address/klv1test/balance',
        expect.anything()
      );
    });

    it('throws on API error response', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: null, error: 'address not found', code: 'internal_issue' })
      );

      await expect(client.getBalance('klv1invalid')).rejects.toThrow('address not found');
    });

    it('throws on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}, 500));

      await expect(client.getBalance('klv1test')).rejects.toThrow('HTTP 500');
    });
  });

  describe('getAccount', () => {
    it('fetches full account details', async () => {
      const accountData = {
        address: 'klv1test',
        nonce: 42,
        balance: 10000000,
        frozenBalance: 5000000,
        allowance: 0,
        permissions: [],
        timestamp: 1700000000,
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { account: accountData }, error: '', code: 'successful' })
      );

      const account = await client.getAccount('klv1test');
      expect(account.address).toBe('klv1test');
      expect(account.nonce).toBe(42);
      expect(account.balance).toBe(10000000);
    });
  });

  describe('getAssetInfo', () => {
    it('fetches asset properties', async () => {
      const assetData = {
        ID: 'S0xW',
        Name: 'S0xFVkVS',
        Ticker: 'S0xW',
        Precision: 6,
        InitialSupply: 29000000000000,
        CirculatingSupply: 28995438394794,
        MintedValue: 29000000000000,
        Properties: { CanMint: true, CanBurn: true, CanFreeze: true },
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { asset: assetData }, error: '', code: 'successful' })
      );

      const asset = await client.getAssetInfo('KLV');
      expect(asset.Precision).toBe(6);
      expect(asset.Properties.CanMint).toBe(true);
    });

    it('URL-encodes the asset ID', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: { asset: { ID: 'test', Precision: 6 } },
          error: '',
          code: 'successful',
        })
      );

      await client.getAssetInfo('LPKLVKFI-3I0N');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.testnet.klever.org/asset/LPKLVKFI-3I0N',
        expect.anything()
      );
    });
  });

  describe('getKDAInfo', () => {
    it('fetches KDA token info for an address', async () => {
      const kdaData = {
        address: 'klv1test',
        asset: 'USDT-A1B2',
        userKDA: {
          balance: 500000,
          frozenBalance: 0,
          LastClaim: { timestamp: 0, epoch: 0 },
        },
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: kdaData, error: '', code: 'successful' })
      );

      const result = await client.getKDAInfo('klv1test', 'USDT-A1B2');
      expect(result.address).toBe('klv1test');
      expect(result.asset).toBe('USDT-A1B2');
      expect(result.userKDA.balance).toBe(500000);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.testnet.klever.org/address/klv1test/kda?asset=USDT-A1B2',
        expect.anything()
      );
    });

    it('URL-encodes the asset ID', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { balance: 100 }, error: '', code: 'successful' })
      );

      await client.getKDAInfo('klv1test', 'LPKLVKFI-3I0N');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.testnet.klever.org/address/klv1test/kda?asset=LPKLVKFI-3I0N',
        expect.anything()
      );
    });

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: null, error: 'asset not found', code: 'internal_issue' })
      );

      await expect(client.getKDAInfo('klv1test', 'FAKE-TOKEN')).rejects.toThrow('asset not found');
    });
  });

  describe('querySmartContract', () => {
    it('sends VM query and returns result', async () => {
      const vmResult = {
        returnData: ['AQID'],
        returnCode: 'ok',
        returnMessage: '',
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: vmResult, error: '', code: 'successful' })
      );

      const result = await client.querySmartContract({
        scAddress: 'klv1contract',
        funcName: 'getValue',
        args: ['AQID'],
      });

      expect(result.returnData).toEqual(['AQID']);
      expect(result.returnCode).toBe('ok');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://node.testnet.klever.org/vm/query',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            scAddress: 'klv1contract',
            funcName: 'getValue',
            args: ['AQID'],
          }),
        })
      );
    });
  });

  describe('getTransaction', () => {
    it('fetches transaction from API proxy', async () => {
      const txData = {
        hash: 'abc123',
        sender: 'klv1sender',
        status: 'success',
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { transaction: txData }, error: '' })
      );

      const tx = await client.getTransaction('abc123');
      expect(tx.hash).toBe('abc123');
      expect(tx.sender).toBe('klv1sender');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.testnet.klever.org/v1.0/transaction/abc123',
        expect.anything()
      );
    });

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: null, error: 'transaction not found' })
      );

      await expect(client.getTransaction('bad')).rejects.toThrow('transaction not found');
    });
  });

  describe('getBlock', () => {
    it('fetches block by nonce', async () => {
      const blockData = {
        hash: 'blockhash',
        nonce: 100,
        timestamp: 1700000000,
        numTxs: 5,
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { block: blockData }, error: '' })
      );

      const block = await client.getBlock(100);
      expect(block.nonce).toBe(100);
      expect(block.hash).toBe('blockhash');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.testnet.klever.org/v1.0/block/by-nonce/100',
        expect.anything()
      );
    });

    it('fetches latest block when no nonce specified', async () => {
      const blockData = {
        hash: 'latest',
        nonce: 999,
        timestamp: 1700000000,
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { blocks: [blockData] }, error: '' })
      );

      const block = await client.getBlock();
      expect(block.nonce).toBe(999);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.testnet.klever.org/v1.0/block/list?limit=1',
        expect.anything()
      );
    });

    it('throws when no blocks returned for latest', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { blocks: [] }, error: '' })
      );

      await expect(client.getBlock()).rejects.toThrow('No blocks returned');
    });
  });

  describe('listValidators', () => {
    it('fetches validator list', async () => {
      const validators = [
        { ownerAddress: 'klv1val1', name: 'Validator 1', commission: 10 },
        { ownerAddress: 'klv1val2', name: 'Validator 2', commission: 5 },
      ];

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { validators }, error: '' })
      );

      const result = await client.listValidators();
      expect(result).toHaveLength(2);
      expect(result[0].ownerAddress).toBe('klv1val1');
    });

    it('returns empty array when no validators', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { validators: null }, error: '' })
      );

      const result = await client.listValidators();
      expect(result).toEqual([]);
    });
  });

  describe('getNonce', () => {
    it('fetches current nonce for address', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { nonce: 15 }, error: '', code: 'successful' })
      );

      const nonce = await client.getNonce('klv1sender');
      expect(nonce).toBe(15);
    });
  });

  describe('buildTransaction', () => {
    it('builds an unsigned transaction', async () => {
      const buildResult = {
        result: {
          txHash: 'hash123',
          tx: 'proto_encoded_tx',
        },
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: buildResult, error: '', code: 'successful' })
      );

      const result = await client.buildTransaction({
        type: 0,
        sender: 'klv1sender',
        nonce: 5,
        contract: [{ type: 0, parameter: { amount: 1000000, toAddress: 'klv1receiver' } }],
      });

      expect(result.result.txHash).toBe('hash123');
      expect(result.result.tx).toBe('proto_encoded_tx');
    });
  });

  describe('getNodeStatus', () => {
    it('fetches node health status', async () => {
      const statusData = {
        isRunning: true,
        isSynced: true,
        currentNonce: 1000,
        currentBlockHash: 'hash',
        appVersion: '1.0.0',
      };

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: statusData, error: '', code: 'successful' })
      );

      const status = await client.getNodeStatus();
      expect(status.isRunning).toBe(true);
      expect(status.isSynced).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles fetch timeout', async () => {
      const timeoutClient = new KleverChainClient({ network: 'testnet', timeout: 1 });
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            setTimeout(() => reject(error), 10);
          })
      );

      await expect(timeoutClient.getBalance('klv1test')).rejects.toThrow();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(client.getBalance('klv1test')).rejects.toThrow('ECONNREFUSED');
    });
  });
});
