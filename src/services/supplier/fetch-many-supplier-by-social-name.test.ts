import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { FetchManySupplierBySocialNameService } from './fetch-many-supplier-by-social-name';
import { NoRecordsFoundError } from '../errors/no-records-found-error';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: FetchManySupplierBySocialNameService; // SUT: System Under Test

describe('Fetch Many Supplier by Social Name Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new FetchManySupplierBySocialNameService(suppliersRepository);
  });

  it('should be able to fetch suppliers by social name', async () => {
    // Arrange: Cria fornecedores, alguns com a mesma razão social
    await suppliersRepository.create({
      social_name: 'Eletrônicos A&B LTDA',
      company_name: 'Empresa A',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });

    await suppliersRepository.create({
      social_name: 'Componentes C&D SA',
      company_name: 'Empresa C',
      phone_number: '22000002222',
      cnpj: '22.222.222/0001-22',
    });

    await suppliersRepository.create({
      social_name: 'Eletrônicos A&B LTDA',
      company_name: 'Filial B',
      phone_number: '33000003333',
      cnpj: '33.333.333/0001-33',
    });

    // Act: Executa o serviço buscando por 'Eletrônicos A&B LTDA'
    const { suppliers } = await sut.execute({ socialName: 'Eletrônicos A&B LTDA' });

    // Assert: Verifica se a lista retornada contém os dois fornecedores corretos
    expect(suppliers).toHaveLength(2);
    expect(suppliers[0].company_name).toEqual('Empresa A');
    expect(suppliers[1].company_name).toEqual('Filial B');
  });

  it('should throw an error if no suppliers are found with the given social name', async () => {
    // Arrange
    await suppliersRepository.create({
      social_name: 'Fornecedor A LTDA',
      company_name: 'Tech Corp',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });

    // Act & Assert: Executa o serviço com uma razão social que não existe e espera um erro
    await expect(() =>
      sut.execute({ socialName: 'Non-Existent LTDA' })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
