import { getPayloadInstance } from '../payload-init';
import { getPayload } from 'payload';

// Mock payload
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

// Mock config
jest.mock('@payload-config', () => ({
  default: { mockConfig: true },
}));

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

describe('payload-init', () => {
  let consoleSpy: jest.SpyInstance;
  let mockPayloadInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockPayloadInstance = { mockPayload: true };
    
    // Reset module-level variables by requiring fresh module
    jest.resetModules();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getPayloadInstance', () => {
    it('should initialize Payload and return instance on first call', async () => {
      mockGetPayload.mockResolvedValue(mockPayloadInstance);

      const result = await getPayloadInstance();

      expect(result).toBe(mockPayloadInstance);
      expect(mockGetPayload).toHaveBeenCalledWith({
        config: { default: { mockConfig: true } },
      });
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Initialisation de Payload...');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Payload initialisé avec succès');
    });

    it('should return cached instance on subsequent calls', async () => {
      mockGetPayload.mockResolvedValue(mockPayloadInstance);

      // First call
      const result1 = await getPayloadInstance();
      
      // Second call
      const result2 = await getPayloadInstance();

      expect(result1).toBe(mockPayloadInstance);
      expect(result2).toBe(mockPayloadInstance);
      expect(result1).toBe(result2);
      expect(mockGetPayload).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors properly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const initError = new Error('Payload initialization failed');
      
      mockGetPayload.mockRejectedValue(initError);

      await expect(getPayloadInstance()).rejects.toThrow('Payload initialization failed');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erreur lors de l\'initialisation de Payload:',
        initError
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle concurrent initialization calls', async () => {
      let resolvePayload: (value: any) => void;
      const payloadPromise = new Promise(resolve => {
        resolvePayload = resolve;
      });
      
      mockGetPayload.mockReturnValue(payloadPromise as any);

      // Start multiple concurrent calls
      const promise1 = getPayloadInstance();
      const promise2 = getPayloadInstance();
      const promise3 = getPayloadInstance();

      // Resolve the payload initialization
      resolvePayload!(mockPayloadInstance);

      // All promises should resolve to the same instance
      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

      expect(result1).toBe(mockPayloadInstance);
      expect(result2).toBe(mockPayloadInstance);
      expect(result3).toBe(mockPayloadInstance);
      expect(mockGetPayload).toHaveBeenCalledTimes(1);
    });

    it('should reinitialize if previous initialization failed', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const initError = new Error('Network error');
      
      // First call fails
      mockGetPayload.mockRejectedValueOnce(initError);
      
      await expect(getPayloadInstance()).rejects.toThrow('Network error');
      
      // Second call should succeed
      mockGetPayload.mockResolvedValue(mockPayloadInstance);
      
      const result = await getPayloadInstance();
      
      expect(result).toBe(mockPayloadInstance);
      expect(mockGetPayload).toHaveBeenCalledTimes(2);
      
      consoleErrorSpy.mockRestore();
    });

    it('should use correct config object', async () => {
      mockGetPayload.mockResolvedValue(mockPayloadInstance);

      await getPayloadInstance();

      expect(mockGetPayload).toHaveBeenCalledWith({
        config: expect.objectContaining({
          default: { mockConfig: true }
        })
      });
    });

    it('should log initialization start and success', async () => {
      mockGetPayload.mockResolvedValue(mockPayloadInstance);

      await getPayloadInstance();

      expect(consoleSpy).toHaveBeenCalledWith('🚀 Initialisation de Payload...');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Payload initialisé avec succès');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout scenarios', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';
      
      mockGetPayload.mockRejectedValue(timeoutError);

      await expect(getPayloadInstance()).rejects.toThrow('Connection timeout');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erreur lors de l\'initialisation de Payload:',
        timeoutError
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle database connection errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');
      dbError.name = 'DatabaseError';
      
      mockGetPayload.mockRejectedValue(dbError);

      await expect(getPayloadInstance()).rejects.toThrow('Database connection failed');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erreur lors de l\'initialisation de Payload:',
        dbError
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});