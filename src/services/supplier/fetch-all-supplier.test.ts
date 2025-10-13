// tests/unit/fetch-all-supplier-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllSupplierService } from '../../services/supplier/fetch-all-supplier';
import { SupplierRepository } from '../../repositories/supplier-repository';
import { Supplier } from '@prisma/client';

// Mock do SupplierRepository
const mockSupplierRepository = {
  findMany: vi.fn(),
} as SupplierRepository;

describe('FetchAllSupplierService', () => {
  let fetchAllSupplierService: FetchAllSupplierService;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchAllSupplierService = new FetchAllSupplierService(mockSupplierRepository);
  });

  describe('execute', () => {
    it('should return all suppliers successfully', async () => {
      // Arrange
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          social_name: 'Fornecedor A LTDA',
          company_name: 'Fornecedor A Comércio',
          phone_number: '(11) 99999-9999',
          cnpj: '12.345.678/0001-90',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          social_name: 'Fornecedor B SA',
          company_name: 'Fornecedor B Indústria',
          phone_number: '(21) 88888-8888',
          cnpj: '98.765.432/0001-10',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findMany.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchAllSupplierService.execute();

      // Assert
      expect(mockSupplierRepository.findMany).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findMany).toHaveBeenCalledWith();
      expect(result.supplier).toEqual(mockSuppliers);
      expect(result.supplier).toHaveLength(2);
      expect(result.supplier[0].social_name).toBe('Fornecedor A LTDA');
      expect(result.supplier[1].social_name).toBe('Fornecedor B SA');
    });

    it('should return empty array when no suppliers exist', async () => {
      // Arrange
      const mockSuppliers: Supplier[] = [];

      mockSupplierRepository.findMany.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchAllSupplierService.execute();

      // Assert
      expect(mockSupplierRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result.supplier).toEqual([]);
      expect(result.supplier).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockSupplierRepository.findMany.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllSupplierService.execute())
        .rejects
        .toThrow('Database connection failed');

      expect(mockSupplierRepository.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return suppliers with correct structure', async () => {
      // Arrange
      const mockSuppliers: Supplier[] = [
        {
          id: '3',
          social_name: 'Fornecedor C EIRELI',
          company_name: 'Fornecedor C Serviços',
          phone_number: '(31) 77777-7777',
          cnpj: '11.222.333/0001-44',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        }
      ];

      mockSupplierRepository.findMany.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchAllSupplierService.execute();

      // Assert
      expect(result.supplier[0]).toMatchObject({
        id: '3',
        social_name: 'Fornecedor C EIRELI',
        company_name: 'Fornecedor C Serviços',
        phone_number: '(31) 77777-7777',
        cnpj: '11.222.333/0001-44'
      });
      expect(result.supplier[0].created_at).toBeInstanceOf(Date);
      expect(result.supplier[0].updated_at).toBeInstanceOf(Date);
    });

    it('should return large number of suppliers', async () => {
      // Arrange
      const mockSuppliers: Supplier[] = Array.from({ length: 100 }, (_, index) => ({
        id: `${index + 1}`,
        social_name: `Fornecedor ${index + 1}`,
        company_name: `Empresa ${index + 1}`,
        phone_number: `(${11 + index}) 99999-9999`,
        cnpj: `${index.toString().padStart(14, '0')}`,
        created_at: new Date(),
        updated_at: new Date()
      }));

      mockSupplierRepository.findMany.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchAllSupplierService.execute();

      // Assert
      expect(mockSupplierRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result.supplier).toHaveLength(100);
      expect(result.supplier[0].id).toBe('1');
      expect(result.supplier[99].id).toBe('100');
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new FetchAllSupplierService(mockSupplierRepository);

      // Assert
      expect(service).toBeInstanceOf(FetchAllSupplierService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: SupplierRepository = {
        findMany: vi.fn(),
      };

      // Act
      const service = new FetchAllSupplierService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(FetchAllSupplierService);
    });
  });

  describe('response format', () => {
    it('should return response with suppliers array property', async () => {
      // Arrange
      const mockSuppliers: Supplier[] = [
        {
          id: '4',
          social_name: 'Fornecedor Teste',
          company_name: 'Empresa Teste',
          phone_number: '(41) 66666-6666',
          cnpj: '99.888.777/0001-55',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findMany.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchAllSupplierService.execute();

      // Assert
      expect(result).toHaveProperty('supplier');
      expect(Array.isArray(result.supplier)).toBe(true);
      expect(result.supplier[0]).toHaveProperty('id');
      expect(result.supplier[0]).toHaveProperty('social_name');
      expect(result.supplier[0]).toHaveProperty('company_name');
      expect(result.supplier[0]).toHaveProperty('phone_number');
      expect(result.supplier[0]).toHaveProperty('cnpj');
      expect(result.supplier[0]).toHaveProperty('created_at');
      expect(result.supplier[0]).toHaveProperty('updated_at');
    });
  });
});