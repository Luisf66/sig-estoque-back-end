import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { PatchSupplierService } from './patch-supplier';
import { NoRecordsFoundError } from '../errors/no-records-found-error';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: PatchSupplierService; // SUT: System Under Test

describe('Patch Supplier Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new PatchSupplierService(suppliersRepository);
  });

  it('should be able to patch a supplier', async () => {
    // Arrange: Cria um fornecedor para ser atualizado
    const createdSupplier = await suppliersRepository.create({
      social_name: 'Fornecedor A LTDA',
      company_name: 'Empresa A',
      phone_number: '11000001111',
      cnpj: '11.111.111/0001-11',
    });

    // Act: Executa o serviço com novos dados parciais
    const { supplier } = await sut.handle({
      id: createdSupplier.id,
      data: {
        company_name: 'Empresa A (Filial)',
        phone_number: '11999998888',
      },
    });

    // Assert: Verifica se os campos foram atualizados e outros permaneceram iguais
    expect(supplier?.company_name).toEqual('Empresa A (Filial)');
    expect(supplier?.phone_number).toEqual('11999998888');
    expect(supplier?.social_name).toEqual('Fornecedor A LTDA'); // Deve permanecer o mesmo
  });

  it('should throw an error if the supplier to patch is not found', async () => {
    // Act & Assert: Tenta atualizar um fornecedor com um ID inexistente e espera um erro
    await expect(() =>
      sut.handle({
        id: 'non-existing-id',
        data: { company_name: 'New Company Name' },
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
