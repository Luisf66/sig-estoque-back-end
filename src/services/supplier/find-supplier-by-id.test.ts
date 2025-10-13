// tests/unit/find-supplier-by-id-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindSupplierByIdService } from '../../services/supplier/find-supplier-by-id';
import { SupplierRepository } from '../../repositories/supplier-repository';
import { NoRecordsFoundError } from '../../services/errors/no-records-found-error';
import { Supplier } from '@prisma/client';

// Mock do SupplierRepository
const mockSupplierRepository = {
  findById: vi.fn(),
} as SupplierRepository;

describe('FindSupplierByIdService', () => {
  let findSupplierByIdService: FindSupplierByIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    findSupplierByIdService = new FindSupplierByIdService(mockSupplierRepository);
  });

  describe('execute', () => {
    it('should return a supplier by id successfully', async () => {
      // Arrange
      const supplierId = '1';
      const mockSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor A LTDA',
        company_name: 'Fornecedor Principal',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(mockSupplier);

      // Act
      const result = await findSupplierByIdService.execute({ supplierId });

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(result.supplier).toEqual(mockSupplier);
      expect(result.supplier.id).toBe(supplierId);
      expect(result.supplier.social_name).toBe('Fornecedor A LTDA');
    });

    it('should throw NoRecordsFoundError when supplier does not exist', async () => {
      // Arrange
      const supplierId = 'non-existent-id';
      
      mockSupplierRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(findSupplierByIdService.execute({ supplierId }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
    });

    it('should throw NoRecordsFoundError when repository returns undefined', async () => {
      // Arrange
      const supplierId = 'invalid-id';
      
      mockSupplierRepository.findById.mockResolvedValue(undefined);

      // Act & Assert
      await expect(findSupplierByIdService.execute({ supplierId }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(mockSupplierRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NoRecordsFoundError with correct message', async () => {
      // Arrange
      const supplierId = '999';
      mockSupplierRepository.findById.mockResolvedValue(null);

      // Act & Assert
      const promise = findSupplierByIdService.execute({ supplierId });

      await expect(promise).rejects.toThrow(NoRecordsFoundError);
      await expect(promise).rejects.toThrow('No records found.');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const supplierId = '1';
      const repositoryError = new Error('Database connection error');
      
      mockSupplierRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findSupplierByIdService.execute({ supplierId }))
        .rejects
        .toThrow('Database connection error');

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(mockSupplierRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should handle UUID format supplier id', async () => {
      // Arrange
      const supplierId = '123e4567-e89b-12d3-a456-426614174000';
      const mockSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor UUID LTDA',
        company_name: 'Fornecedor UUID Comércio',
        phone_number: '(21) 88888-8888',
        cnpj: '98.765.432/0001-10',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(mockSupplier);

      // Act
      const result = await findSupplierByIdService.execute({ supplierId });

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(result.supplier.id).toBe(supplierId);
    });

    it('should handle numeric string supplier id', async () => {
      // Arrange
      const supplierId = '12345';
      const mockSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor Numérico LTDA',
        company_name: 'Fornecedor Numérico',
        phone_number: '(31) 77777-7777',
        cnpj: '11.222.333/0001-44',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(mockSupplier);

      // Act
      const result = await findSupplierByIdService.execute({ supplierId });

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith('12345');
      expect(result.supplier.id).toBe('12345');
    });

    it('should throw NoRecordsFoundError with empty string id', async () => {
      // Arrange
      const supplierId = '';
      
      mockSupplierRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(findSupplierByIdService.execute({ supplierId }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith('');
    });

    it('should return supplier with complete data structure', async () => {
      // Arrange
      const supplierId = '5';
      const mockSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor Completo LTDA',
        company_name: 'Fornecedor Completo Comércio',
        phone_number: '(41) 66666-6666',
        cnpj: '99.888.777/0001-55',
        created_at: new Date('2023-01-01T10:00:00Z'),
        updated_at: new Date('2023-01-02T15:30:00Z')
      };

      mockSupplierRepository.findById.mockResolvedValue(mockSupplier);

      // Act
      const result = await findSupplierByIdService.execute({ supplierId });

      // Assert
      expect(result.supplier).toMatchObject({
        id: '5',
        social_name: 'Fornecedor Completo LTDA',
        company_name: 'Fornecedor Completo Comércio',
        phone_number: '(41) 66666-6666',
        cnpj: '99.888.777/0001-55'
      });
      expect(result.supplier.created_at).toBeInstanceOf(Date);
      expect(result.supplier.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new FindSupplierByIdService(mockSupplierRepository);

      // Assert
      expect(service).toBeInstanceOf(FindSupplierByIdService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: SupplierRepository = {
        findById: vi.fn(),
      };

      // Act
      const service = new FindSupplierByIdService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(FindSupplierByIdService);
    });
  });

  describe('response format', () => {
    it('should return response with supplier property', async () => {
      // Arrange
      const supplierId = '10';
      const mockSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor Teste LTDA',
        company_name: 'Fornecedor Teste',
        phone_number: '(51) 55555-5555',
        cnpj: '88.777.666/0001-66',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(mockSupplier);

      // Act
      const result = await findSupplierByIdService.execute({ supplierId });

      // Assert
      expect(result).toHaveProperty('supplier');
      expect(result.supplier).toHaveProperty('id');
      expect(result.supplier).toHaveProperty('social_name');
      expect(result.supplier).toHaveProperty('company_name');
      expect(result.supplier).toHaveProperty('phone_number');
      expect(result.supplier).toHaveProperty('cnpj');
      expect(result.supplier).toHaveProperty('created_at');
      expect(result.supplier).toHaveProperty('updated_at');
    });
  });

  describe('error handling', () => {
    it('should handle multiple consecutive calls with different ids', async () => {
      // Arrange
      const supplierId1 = '1';
      const supplierId2 = '2';
      
      const mockSupplier1: Supplier = {
        id: supplierId1,
        social_name: 'Fornecedor 1 LTDA',
        company_name: 'Fornecedor 1',
        phone_number: '(11) 11111-1111',
        cnpj: '11.111.111/0001-11',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockSupplier2: Supplier = {
        id: supplierId2,
        social_name: 'Fornecedor 2 LTDA',
        company_name: 'Fornecedor 2',
        phone_number: '(22) 22222-2222',
        cnpj: '22.222.222/0001-22',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupplierRepository.findById
        .mockResolvedValueOnce(mockSupplier1)
        .mockResolvedValueOnce(mockSupplier2);

      // Act & Assert - Primeira chamada
      const result1 = await findSupplierByIdService.execute({ supplierId: supplierId1 });
      expect(result1.supplier.id).toBe('1');
      expect(result1.supplier.social_name).toBe('Fornecedor 1 LTDA');

      // Segunda chamada
      const result2 = await findSupplierByIdService.execute({ supplierId: supplierId2 });
      expect(result2.supplier.id).toBe('2');
      expect(result2.supplier.social_name).toBe('Fornecedor 2 LTDA');

      expect(mockSupplierRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockSupplierRepository.findById).toHaveBeenNthCalledWith(1, supplierId1);
      expect(mockSupplierRepository.findById).toHaveBeenNthCalledWith(2, supplierId2);
    });
  });
});