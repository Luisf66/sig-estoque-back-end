// tests/unit/patch-supplier-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatchSupplierService } from '../../services/supplier/patch-supplier';
import { SupplierRepository } from '../../repositories/supplier-repository';
import { NoRecordsFoundError } from '../../services/errors/no-records-found-error';
import { Supplier } from '@prisma/client';

// Mock do SupplierRepository
const mockSupplierRepository = {
  findById: vi.fn(),
  patch: vi.fn(),
} as SupplierRepository;

describe('PatchSupplierService', () => {
  let patchSupplierService: PatchSupplierService;

  beforeEach(() => {
    vi.clearAllMocks();
    patchSupplierService = new PatchSupplierService(mockSupplierRepository);
  });

  describe('handle', () => {
    it('should update supplier partial data successfully', async () => {
      // Arrange
      const supplierId = '1';
      const updateData = {
        social_name: 'Novo Nome Social LTDA',
        phone_number: '(11) 88888-8888'
      };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor Antigo LTDA',
        company_name: 'Fornecedor Principal',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        ...updateData,
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
      expect(result.supplier).toEqual(updatedSupplier);
      expect(result.supplier?.social_name).toBe('Novo Nome Social LTDA');
      expect(result.supplier?.phone_number).toBe('(11) 88888-8888');
      expect(result.supplier?.company_name).toBe('Fornecedor Principal'); // Manteve o valor original
    });

    it('should throw NoRecordsFoundError when supplier does not exist', async () => {
      // Arrange
      const supplierId = 'non-existent-id';
      const updateData = {
        company_name: 'Nova Empresa'
      };

      mockSupplierRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(patchSupplierService.handle({
        id: supplierId,
        data: updateData
      })).rejects.toThrow(NoRecordsFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(mockSupplierRepository.patch).not.toHaveBeenCalled();
    });

    it('should update only social_name when provided', async () => {
      // Arrange
      const supplierId = '2';
      const updateData = {
        social_name: 'Novo Nome Social Atualizado'
      };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Nome Social Antigo',
        company_name: 'Empresa Teste',
        phone_number: '(21) 77777-7777',
        cnpj: '98.765.432/0001-10',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        social_name: 'Novo Nome Social Atualizado',
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
      expect(result.supplier?.social_name).toBe('Novo Nome Social Atualizado');
      expect(result.supplier?.company_name).toBe('Empresa Teste'); // Manteve o original
    });

    it('should update only company_name when provided', async () => {
      // Arrange
      const supplierId = '3';
      const updateData = {
        company_name: 'Nova Razão Social'
      };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor C LTDA',
        company_name: 'Empresa Antiga',
        phone_number: '(31) 66666-6666',
        cnpj: '11.222.333/0001-44',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        company_name: 'Nova Razão Social',
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
      expect(result.supplier?.company_name).toBe('Nova Razão Social');
      expect(result.supplier?.social_name).toBe('Fornecedor C LTDA'); // Manteve o original
    });

    it('should update only phone_number when provided', async () => {
      // Arrange
      const supplierId = '4';
      const updateData = {
        phone_number: '(41) 55555-5555'
      };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor D LTDA',
        company_name: 'Fornecedor D',
        phone_number: '(41) 44444-4444',
        cnpj: '99.888.777/0001-55',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        phone_number: '(41) 55555-5555',
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
      expect(result.supplier?.phone_number).toBe('(41) 55555-5555');
    });

    it('should update only cnpj when provided', async () => {
      // Arrange
      const supplierId = '5';
      const updateData = {
        cnpj: '77.666.555/0001-77'
      };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor E LTDA',
        company_name: 'Fornecedor E',
        phone_number: '(51) 33333-3333',
        cnpj: '88.777.666/0001-66',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        cnpj: '77.666.555/0001-77',
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
      expect(result.supplier?.cnpj).toBe('77.666.555/0001-77');
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const supplierId = '6';
      const updateData = {
        social_name: 'Nome Social Atualizado',
        company_name: 'Razão Social Atualizada',
        phone_number: '(61) 22222-2222'
      };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Nome Social Original',
        company_name: 'Razão Social Original',
        phone_number: '(61) 11111-1111',
        cnpj: '66.555.444/0001-88',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        ...updateData,
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
      expect(result.supplier?.social_name).toBe('Nome Social Atualizado');
      expect(result.supplier?.company_name).toBe('Razão Social Atualizada');
      expect(result.supplier?.phone_number).toBe('(61) 22222-2222');
      expect(result.supplier?.cnpj).toBe('66.555.444/0001-88'); // Manteve o original
    });

    it('should handle empty update data object', async () => {
      // Arrange
      const supplierId = '7';
      const updateData = {};

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor F LTDA',
        company_name: 'Fornecedor F',
        phone_number: '(71) 99999-9999',
        cnpj: '55.444.333/0001-99',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(existingSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      // Assert
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, {});
      expect(result.supplier).toEqual(existingSupplier);
    });

    it('should propagate repository errors during find', async () => {
      // Arrange
      const supplierId = '1';
      const updateData = { social_name: 'Novo Nome' };
      const repositoryError = new Error('Database connection failed');

      mockSupplierRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(patchSupplierService.handle({
        id: supplierId,
        data: updateData
      })).rejects.toThrow('Database connection failed');

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(mockSupplierRepository.patch).not.toHaveBeenCalled();
    });

    it('should propagate repository errors during patch', async () => {
      // Arrange
      const supplierId = '1';
      const updateData = { social_name: 'Novo Nome' };
      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Fornecedor Antigo',
        company_name: 'Empresa Antiga',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        created_at: new Date(),
        updated_at: new Date()
      };
      const repositoryError = new Error('Update failed');

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(patchSupplierService.handle({
        id: supplierId,
        data: updateData
      })).rejects.toThrow('Update failed');

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
      expect(mockSupplierRepository.patch).toHaveBeenCalledWith(supplierId, updateData);
    });

    it('should throw NoRecordsFoundError with correct message', async () => {
      // Arrange
      const supplierId = 'non-existent';
      const updateData = { company_name: 'Nova Empresa' };

      mockSupplierRepository.findById.mockResolvedValue(null);

      // Act & Assert
      const promise = patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

      await expect(promise).rejects.toThrow(NoRecordsFoundError);
      await expect(promise).rejects.toThrow('No records found.');
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new PatchSupplierService(mockSupplierRepository);

      // Assert
      expect(service).toBeInstanceOf(PatchSupplierService);
    });
  });

  describe('response format', () => {
    it('should return response with supplier property', async () => {
      // Arrange
      const supplierId = '8';
      const updateData = { social_name: 'Nome Teste' };

      const existingSupplier: Supplier = {
        id: supplierId,
        social_name: 'Nome Original',
        company_name: 'Empresa Teste',
        phone_number: '(81) 88888-8888',
        cnpj: '44.333.222/0001-00',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        social_name: 'Nome Teste',
        updated_at: new Date()
      };

      mockSupplierRepository.findById.mockResolvedValue(existingSupplier);
      mockSupplierRepository.patch.mockResolvedValue(updatedSupplier);

      // Act
      const result = await patchSupplierService.handle({
        id: supplierId,
        data: updateData
      });

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
});