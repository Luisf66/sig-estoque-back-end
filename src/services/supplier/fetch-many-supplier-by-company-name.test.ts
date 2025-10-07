import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { FetchManySupplierByCompanyNameService } from './fetch-many-supplier-by-company-name';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: FetchManySupplierByCompanyNameService; // SUT: System Under Test

describe('Fetch Many Supplier by Company Name Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new FetchManySupplierByCompanyNameService(suppliersRepository);
  });

  it('should be able to fetch suppliers by company name', async () => {
    // Arrange: Cria fornecedores, alguns com o mesmo nome de empresa
    await suppliersRepository.create({
      social_name: 'Fornecedor A LTDA',
      company_name: 'Tech Corp',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });

    await suppliersRepository.create({
      social_name: 'Fornecedor B SA',
      company_name: 'Innovate Solutions',
      phone_number: '22000002222',
      cnpj: '22.222.222/0001-22',
    });

    await suppliersRepository.create({
      social_name: 'Fornecedor C ME',
      company_name: 'Tech Corp',
      phone_number: '33000003333',
      cnpj: '33.333.333/0001-33',
    });

    // Act: Executa o serviço buscando por 'Tech Corp'
    const { supplier } = await sut.execute({ companyName: 'Tech Corp' });

    // Assert: Verifica se a lista retornada contém os dois fornecedores corretos
    expect(supplier).toHaveLength(2);
    expect(supplier[0].social_name).toEqual('Fornecedor A LTDA');
    expect(supplier[1].social_name).toEqual('Fornecedor C ME');
  });

  it('should return an empty array if no suppliers are found with the given company name', async () => {
    // Arrange
    await suppliersRepository.create({
      social_name: 'Fornecedor A LTDA',
      company_name: 'Tech Corp',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });
    
    // Act: Executa o serviço com um nome de empresa que não existe
    const { supplier } = await sut.execute({ companyName: 'Non-Existent Corp' });

    // Assert: Verifica se a lista retornada está vazia
    expect(supplier).toHaveLength(0);
  });
});
