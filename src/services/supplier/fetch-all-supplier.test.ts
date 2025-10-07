import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { FetchAllSupplierService } from './fetch-all-supplier';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: FetchAllSupplierService; // SUT: System Under Test

describe('Fetch All Supplier Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new FetchAllSupplierService(suppliersRepository);
  });

  it('should be able to fetch all suppliers', async () => {
    // Arrange: Cria dois fornecedores de exemplo
    await suppliersRepository.create({
      social_name: 'Fornecedor A LTDA',
      company_name: 'Empresa A',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });

    await suppliersRepository.create({
      social_name: 'Fornecedor B SA',
      company_name: 'Empresa B',
      phone_number: '22000002222',
      cnpj: '22.222.222/0001-22',
    });

    // Act: Executa o serviço
    const { supplier } = await sut.execute();

    // Assert: Verifica se a lista retornada contém os dois fornecedores
    expect(supplier).toHaveLength(2);
    expect(supplier[0].company_name).toEqual('Empresa A');
    expect(supplier[1].company_name).toEqual('Empresa B');
  });

  it('should return an empty array if no suppliers are found', async () => {
    // Act: Executa o serviço com o repositório vazio
    const { supplier } = await sut.execute();

    // Assert: Verifica se a lista retornada está vazia
    expect(supplier).toHaveLength(0);
  });
});
