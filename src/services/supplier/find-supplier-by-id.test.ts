import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { FindSupplierByIdService } from './find-supplier-by-id';
import { NoRecordsFoundError } from '../errors/no-records-found-error';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: FindSupplierByIdService; // SUT: System Under Test

describe('Find Supplier by ID Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new FindSupplierByIdService(suppliersRepository);
  });

  it('should be able to find a supplier by id', async () => {
    // Arrange: Cria um fornecedor de exemplo
    const createdSupplier = await suppliersRepository.create({
      social_name: 'Fornecedor A LTDA',
      company_name: 'Empresa A',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });

    // Act: Executa o serviço com o ID do fornecedor criado
    const { supplier } = await sut.execute({ supplierId: createdSupplier.id });

    // Assert: Verifica se o fornecedor retornado é o correto
    expect(supplier.id).toEqual(createdSupplier.id);
    expect(supplier.company_name).toEqual('Empresa A');
  });

  it('should throw an error if the supplier is not found', async () => {
    // Act & Assert: Tenta buscar um fornecedor com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ supplierId: 'non-existing-id' })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
