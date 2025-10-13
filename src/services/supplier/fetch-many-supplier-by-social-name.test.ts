// tests/unit/fetch-many-supplier-by-social-name-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchManySupplierBySocialNameService } from '../../services/supplier/fetch-many-supplier-by-social-name';
import { SupplierRepository } from '../../repositories/supplier-repository';
import { NoRecordsFoundError } from '../../services/errors/no-records-found-error';
import { Supplier } from '@prisma/client';

// Mock do SupplierRepository
const mockSupplierRepository = {
  findManyBySocialName: vi.fn(),
} as SupplierRepository;

describe('FetchManySupplierBySocialNameService', () => {
  let fetchManySupplierBySocialNameService: FetchManySupplierBySocialNameService;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchManySupplierBySocialNameService = new FetchManySupplierBySocialNameService(mockSupplierRepository);
  });

  describe('execute', () => {
    it('should return suppliers by social name successfully', async () => {
      // Arrange
      const socialName = 'Fornecedor';
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

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith(socialName);
      expect(result.suppliers).toEqual(mockSuppliers);
      expect(result.suppliers).toHaveLength(2);
      expect(result.suppliers[0].social_name).toBe('Fornecedor A LTDA');
      expect(result.suppliers[1].social_name).toBe('Fornecedor B SA');
    });

    it('should throw NoRecordsFoundError when no suppliers match the social name', async () => {
      // Arrange
      const socialName = 'Empresa Inexistente';
      const mockSuppliers: Supplier[] = [];

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act & Assert
      await expect(fetchManySupplierBySocialNameService.execute({ socialName }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledTimes(1);
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith(socialName);
    });

    it('should throw NoRecordsFoundError with correct message', async () => {
      // Arrange
      const socialName = 'Nome Inexistente';
      mockSupplierRepository.findManyBySocialName.mockResolvedValue([]);

      // Act & Assert
      const promise = fetchManySupplierBySocialNameService.execute({ socialName });

      await expect(promise).rejects.toThrow(NoRecordsFoundError);
      await expect(promise).rejects.toThrow('No records found.');
    });

    it('should handle case-insensitive social name search', async () => {
      // Arrange
      const socialName = 'fornecedor';
      const mockSuppliers: Supplier[] = [
        {
          id: '3',
          social_name: 'FORNECEDOR CORPORATION LTDA',
          company_name: 'Fornecedor Corp',
          phone_number: '(31) 77777-7777',
          cnpj: '11.222.333/0001-44',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith('fornecedor');
      expect(result.suppliers[0].social_name).toBe('FORNECEDOR CORPORATION LTDA');
    });

    it('should handle partial social name matches', async () => {
      // Arrange
      const socialName = 'Tech';
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

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith('Tech');
      expect(result.suppliers).toHaveLength(2);
      expect(result.suppliers[0].social_name).toContain('Tech');
      expect(result.suppliers[1].social_name).toContain('Tech');
    });

    it('should handle repository errors', async () => {
      // Arrange
      const socialName = 'Test Company';
      const repositoryError = new Error('Database connection failed');
      
      mockSupplierRepository.findManyBySocialName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchManySupplierBySocialNameService.execute({ socialName }))
        .rejects
        .toThrow('Database connection failed');

      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith(socialName);
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in social name', async () => {
      // Arrange
      const socialName = 'Comércio & Cia';
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

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith('Comércio & Cia');
      expect(result.suppliers[0].social_name).toBe('Comércio & Cia LTDA');
    });

    it('should handle long social names', async () => {
      // Arrange
      const socialName = 'Empresa com nome social muito longo para teste';
      const mockSuppliers: Supplier[] = [
        {
          id: '7',
          social_name: 'Empresa com nome social muito longo para teste de limite LTDA',
          company_name: 'Empresa Comércio',
          phone_number: '(71) 33333-3333',
          cnpj: '66.555.444/0001-88',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith(socialName);
      expect(result.suppliers[0].social_name).toContain('nome social muito longo');
    });

    it('should throw NoRecordsFoundError with empty string social name when no results', async () => {
      // Arrange
      const socialName = '';
      const mockSuppliers: Supplier[] = [];

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act & Assert
      await expect(fetchManySupplierBySocialNameService.execute({ socialName }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith('');
    });

    it('should return single supplier when only one matches', async () => {
      // Arrange
      const socialName = 'Fornecedor Exclusivo';
      const mockSuppliers: Supplier[] = [
        {
          id: '8',
          social_name: 'Fornecedor Exclusivo LTDA',
          company_name: 'Fornecedor Exclusivo Comércio',
          phone_number: '(81) 22222-2222',
          cnpj: '55.444.333/0001-99',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(result.suppliers).toHaveLength(1);
      expect(result.suppliers[0].social_name).toBe('Fornecedor Exclusivo LTDA');
      expect(mockSupplierRepository.findManyBySocialName).toHaveBeenCalledWith(socialName);
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new FetchManySupplierBySocialNameService(mockSupplierRepository);

      // Assert
      expect(service).toBeInstanceOf(FetchManySupplierBySocialNameService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: SupplierRepository = {
        findManyBySocialName: vi.fn(),
      };

      // Act
      const service = new FetchManySupplierBySocialNameService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(FetchManySupplierBySocialNameService);
    });
  });

  describe('response format', () => {
    it('should return response with suppliers array property', async () => {
      // Arrange
      const socialName = 'Test Social Name';
      const mockSuppliers: Supplier[] = [
        {
          id: '9',
          social_name: 'Test Social Name LTDA',
          company_name: 'Test Company',
          phone_number: '(91) 11111-1111',
          cnpj: '44.333.222/0001-00',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockSupplierRepository.findManyBySocialName.mockResolvedValue(mockSuppliers);

      // Act
      const result = await fetchManySupplierBySocialNameService.execute({ socialName });

      // Assert
      expect(result).toHaveProperty('suppliers');
      expect(Array.isArray(result.suppliers)).toBe(true);
      expect(result.suppliers[0]).toHaveProperty('id');
      expect(result.suppliers[0]).toHaveProperty('social_name');
      expect(result.suppliers[0]).toHaveProperty('company_name');
      expect(result.suppliers[0]).toHaveProperty('phone_number');
      expect(result.suppliers[0]).toHaveProperty('cnpj');
      expect(result.suppliers[0]).toHaveProperty('created_at');
      expect(result.suppliers[0]).toHaveProperty('updated_at');
    });
  });
});