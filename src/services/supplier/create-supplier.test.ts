// tests/unit/create-supplier-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSupplierService } from '../../services/supplier/create-supplier';
import { SupplierRepository } from '../../repositories/supplier-repository';
import { Supplier } from '@prisma/client';
import { UserAlreadyExistsError } from '../../services/errors/user-already-exists-error'; // ajuste o caminho

// Mock do SupplierRepository
const mockSupplierRepository: SupplierRepository = {
  create: vi.fn(),
  // Adicione outros métodos se necessário para o teste
};

describe('CreateSupplierService', () => {
  let createSupplierService: CreateSupplierService;

  beforeEach(() => {
    vi.clearAllMocks();
    createSupplierService = new CreateSupplierService(mockSupplierRepository);
  });

  describe('handle', () => {
    it('should create a supplier successfully', async () => {
      // Arrange
      const mockSupplierData = {
        social_name: 'Fornecedor LTDA',
        company_name: 'Fornecedor Comércio',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90'
      };

      const mockCreatedSupplier: Supplier = {
        id: '1',
        ...mockSupplierData,
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.mocked(mockSupplierRepository.create).mockResolvedValue(mockCreatedSupplier);

      // Act
      const result = await createSupplierService.handle(mockSupplierData);

      // Assert
      expect(mockSupplierRepository.create).toHaveBeenCalledWith(mockSupplierData);
      expect(mockSupplierRepository.create).toHaveBeenCalledTimes(1);
      expect(result.supplier).toEqual(mockCreatedSupplier);
      expect(result.supplier.id).toBe('1');
      expect(result.supplier.social_name).toBe(mockSupplierData.social_name);
      expect(result.supplier.cnpj).toBe(mockSupplierData.cnpj);
    });

    it('should pass all supplier data to repository', async () => {
      // Arrange
      const mockSupplierData = {
        social_name: 'Nova Empresa SA',
        company_name: 'Nova Empresa Comércio',
        phone_number: '(21) 88888-8888',
        cnpj: '98.765.432/0001-10'
      };

      const mockCreatedSupplier: Supplier = {
        id: '2',
        ...mockSupplierData,
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.mocked(mockSupplierRepository.create).mockResolvedValue(mockCreatedSupplier);

      // Act
      await createSupplierService.handle(mockSupplierData);

      // Assert
      expect(mockSupplierRepository.create).toHaveBeenCalledWith({
        social_name: 'Nova Empresa SA',
        company_name: 'Nova Empresa Comércio',
        phone_number: '(21) 88888-8888',
        cnpj: '98.765.432/0001-10'
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockSupplierData = {
        social_name: 'Fornecedor Teste',
        company_name: 'Fornecedor Teste LTDA',
        phone_number: '(31) 77777-7777',
        cnpj: '11.222.333/0001-44'
      };

      const repositoryError = new Error('Database connection failed');
      vi.mocked(mockSupplierRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createSupplierService.handle(mockSupplierData))
        .rejects
        .toThrow('Database connection failed');
      
      expect(mockSupplierRepository.create).toHaveBeenCalledWith(mockSupplierData);
    });

    // Teste para verificar se o serviço lida com CNPJ duplicado (se aplicável)
    it('should throw UserAlreadyExistsError when CNPJ already exists', async () => {
      // Arrange
      const mockSupplierData = {
        social_name: 'Fornecedor Duplicado',
        company_name: 'Fornecedor Duplicado LTDA',
        phone_number: '(41) 66666-6666',
        cnpj: '99.888.777/0001-55'
      };

      // Simule que o repositório lança UserAlreadyExistsError para CNPJ duplicado
      vi.mocked(mockSupplierRepository.create).mockRejectedValue(new UserAlreadyExistsError());

      // Act & Assert
      await expect(createSupplierService.handle(mockSupplierData))
        .rejects
        .toThrow(UserAlreadyExistsError);
      
      await expect(createSupplierService.handle(mockSupplierData))
        .rejects
        .toThrow('E-mail already exists.');
    });

    it('should handle empty or null values if allowed by business rules', async () => {
      // Arrange
      const mockSupplierData = {
        social_name: '', // string vazia
        company_name: 'Empresa Válida',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90'
      };

      const mockCreatedSupplier: Supplier = {
        id: '3',
        ...mockSupplierData,
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.mocked(mockSupplierRepository.create).mockResolvedValue(mockCreatedSupplier);

      // Act
      const result = await createSupplierService.handle(mockSupplierData);

      // Assert
      expect(mockSupplierRepository.create).toHaveBeenCalledWith(mockSupplierData);
      expect(result.supplier.social_name).toBe('');
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new CreateSupplierService(mockSupplierRepository);

      // Assert
      expect(service).toBeInstanceOf(CreateSupplierService);
    });
  });
});