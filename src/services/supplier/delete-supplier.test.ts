import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { DeleteSupplierService } from './delete-supplier';
import { NoRecordsFoundError } from '../errors/no-records-found-error';

// Declaração das variáveis
let suppliersRepository: InMemorySuppliersRepository;
let sut: DeleteSupplierService; // SUT: System Under Test

describe('Delete Supplier Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    suppliersRepository = new InMemorySuppliersRepository();
    sut = new DeleteSupplierService(suppliersRepository);
  });

  it('should be able to delete a supplier', async () => {
    // Arrange: Cria um fornecedor para ser deletado
    const createdSupplier = await suppliersRepository.create({
      social_name: 'Fornecedor Teste LTDA',
      company_name: 'Teste Corp',
      phone_number: '11999998888',
      cnpj: '98.765.432/0001-11',
    });

    // Act: Executa o serviço de deleção
    await sut.execute({ id: createdSupplier.id });

    // Assert: Verifica se o fornecedor foi removido do repositório
    const supplier = await suppliersRepository.findById(createdSupplier.id);
    expect(supplier).toBeNull();
  });

  it('should throw an error if the supplier is not found', async () => {
    // Act & Assert: Tenta deletar um fornecedor com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ id: 'non-existing-id' })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
