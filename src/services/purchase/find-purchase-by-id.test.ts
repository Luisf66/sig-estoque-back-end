import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { FindPurchaseByIdService } from './find-purchase-by-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let purchaseRepository: InMemoryPurchaseRepository;
let sut: FindPurchaseByIdService; // SUT: System Under Test

describe('Find Purchase By Id Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    purchaseRepository = new InMemoryPurchaseRepository();
    sut = new FindPurchaseByIdService(purchaseRepository);
  });

  it('should be able to find a purchase by its id', async () => {
    // Arrange: Cria uma compra de exemplo
    const createdPurchase = await purchaseRepository.create({
      nf_number: 'NF-123',
      supplier: { connect: { id: 'supplier-01' } },
      user: { connect: { id: 'user-01' } },
    });

    // Act: Executa o serviço buscando a compra pelo ID
    const { purchase } = await sut.execute({ purchaseId: createdPurchase.id });

    // Assert: Verifica se a compra retornada é a correta
    expect(purchase.id).toEqual(createdPurchase.id);
    expect(purchase.nf_number).toEqual('NF-123');
  });

  it('should throw an error if the purchase is not found', async () => {
    // Act & Assert: Tenta buscar uma compra com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ purchaseId: 'non-existing-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
