// tests/unit/fetch-many-supplier-by-company-name-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchManySupplierByCompanyNameService } from '../../services/supplier/fetch-many-supplier-by-company-name';
import { SupplierRepository } from '../../repositories/supplier-repository';
import { Supplier } from '@prisma/client';

// Mock do SupplierRepository
const mockSupplierRepository = {
  findManyByCompanyName: vi.fn(),
} as SupplierRepository;

describe('FetchManySupplierByCompanyNameService', () => {
  let fetchManySupplierByCompanyNameService: FetchManySupplierByCompanyNameService;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchManySupplierByCompanyNameService = new FetchManySupplierByCompanyNameService(mockSupplierRepository);
  });

  describe('execute', () => {
    it('should return suppliers by company name successfully', async () => {
      // Arrange
      const companyName = 'Fornecedor';
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          social_name: 'Fornecedor A LTDA',
          company_name: 'Fornecedor Principal',
          phone_number: '(11) 99999-9999',
          cnpj: '12.345.678/0001-90',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          social_name: 'Fornecedor B SA',
          company_name: 'Fornecedor Secundário',
          phone_number: '(21) 88888-8888',
          cnpj: '98.765.432/0001-10',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith(companyName);
      expect(result.supplier).toEqual(mockSuppliers);
      expect(result.supplier).toHaveLength(2);
      expect(result.supplier[0].company_name).toBe('Fornecedor Principal');
      expect(result.supplier[1].company_name).toBe('Fornecedor Secundário');
    });

    it('should return empty array when no suppliers match the company name', async () => {
      // Arrange
      const companyName = 'Empresa Inexistente';
      const mockSuppliers: Supplier[] = [];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith(companyName);
      expect(result.supplier).toEqual([]);
      expect(result.supplier).toHaveLength(0);
    });

    it('should handle case-insensitive company name search', async () => {
      // Arrange
      const companyName = 'fornecedor';
      const mockSuppliers: Supplier[] = [
        {
          id: '3',
          social_name: 'Fornecedor C LTDA',
          company_name: 'FORNECEDOR CORPORATION',
          phone_number: '(31) 77777-7777',
          cnpj: '11.222.333/0001-44',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith('fornecedor');
      expect(result.supplier[0].company_name).toBe('FORNECEDOR CORPORATION');
    });

    it('should handle partial company name matches', async () => {
      // Arrange
      const companyName = 'Tech';
      const mockSuppliers: Supplier[] = [
        {
          id: '4',
          social_name: 'Tech Solutions LTDA',
          company_name: 'Tech Solutions Brasil',
          phone_number: '(41) 66666-6666',
          cnpj: '99.888.777/0001-55',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '5',
          social_name: 'Advanced Tech SA',
          company_name: 'Advanced Tech International',
          phone_number: '(51) 55555-5555',
          cnpj: '88.777.666/0001-66',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith('Tech');
      expect(result.supplier).toHaveLength(2);
      expect(result.supplier[0].company_name).toContain('Tech');
      expect(result.supplier[1].company_name).toContain('Tech');
    });

    it('should handle repository errors', async () => {
      // Arrange
      const companyName = 'Test Company';
      const repositoryError = new Error('Database connection failed');
      
      mockSupplierRepository.findManyByCompanyName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchManySupplierByCompanyNameService.execute({ companyName }))
        .rejects
        .toThrow('Database connection failed');

      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith(companyName);
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in company name', async () => {
      // Arrange
      const companyName = 'Comércio & Cia';
      const mockSuppliers: Supplier[] = [
        {
          id: '6',
          social_name: 'Comércio & Cia LTDA',
          company_name: 'Comércio & Cia Importação',
          phone_number: '(61) 44444-4444',
          cnpj: '77.666.555/0001-77',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith('Comércio & Cia');
      expect(result.supplier[0].company_name).toBe('Comércio & Cia Importação');
    });

    it('should handle long company names', async () => {
      // Arrange
      const companyName = 'Empresa com nome muito longo para teste de limite';
      const mockSuppliers: Supplier[] = [
        {
          id: '7',
          social_name: 'Empresa com nome muito longo para teste de limite LTDA',
          company_name: 'Empresa com nome muito longo para teste de limite Comércio',
          phone_number: '(71) 33333-3333',
          cnpj: '66.555.444/0001-88',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith(companyName);
      expect(result.supplier[0].company_name).toContain('nome muito longo');
    });

    it('should handle empty string company name', async () => {
      // Arrange
      const companyName = '';
      const mockSuppliers: Supplier[] = [];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

      // Assert
      expect(mockSupplierRepository.findManyByCompanyName).toHaveBeenCalledWith('');
      expect(result.supplier).toEqual([]);
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new FetchManySupplierByCompanyNameService(mockSupplierRepository);

      // Assert
      expect(service).toBeInstanceOf(FetchManySupplierByCompanyNameService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: SupplierRepository = {
        findManyByCompanyName: vi.fn(),
      };

      // Act
      const service = new FetchManySupplierByCompanyNameService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(FetchManySupplierByCompanyNameService);
    });
  });

  describe('response format', () => {
    it('should return response with suppliers array property', async () => {
      // Arrange
      const companyName = 'Test Company';
      const mockSuppliers: Supplier[] = [
        {
          id: '8',
          social_name: 'Test Supplier LTDA',
          company_name: 'Test Company',
          phone_number: '(81) 22222-2222',
          cnpj: '55.444.333/0001-99',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyByCompanyName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierByCompanyNameService.execute({ companyName });

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