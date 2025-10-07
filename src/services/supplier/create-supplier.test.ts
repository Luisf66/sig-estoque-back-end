import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { CreateSupplierService } from './create-supplier';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: CreateSupplierService; // SUT: System Under Test

describe('Create Supplier Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new CreateSupplierService(suppliersRepository);
  });

  it('should be able to create a new supplier', async () => {
    // Act: Executa o serviço com os dados de um novo fornecedor
    const { supplier } = await sut.handle({
      social_name: 'Eletrônicos Fantasia LTDA',
      company_name: 'Fantasia Corp',
      phone_number: '11987654321',
      cnpj: '12.345.678/0001-99',
    });

    // Assert: Verifica se o fornecedor foi criado com um ID e se está no repositório
    expect(supplier.id).toEqual(expect.any(String));
    expect(suppliersRepository.items[0].company_name).toEqual('Fantasia Corp');
  });
});
