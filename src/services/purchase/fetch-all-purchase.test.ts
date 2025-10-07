import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { FetchAllPurchaseService } from './fetch-all-purchase';

// Declaração das variáveis
let purchaseRepository: InMemoryPurchaseRepository;
let sut: FetchAllPurchaseService; // SUT: System Under Test

describe('Fetch All Purchase Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    purchaseRepository = new InMemoryPurchaseRepository();
    sut = new FetchAllPurchaseService(purchaseRepository);
  });

  it('should be able to fetch all purchases', async () => {
    // Arrange: Cria algumas compras de exemplo
    await purchaseRepository.create({
      nf_number: 'NF-001',
      supplier: { connect: { id: 'supplier-01' } },
      user: { connect: { id: 'user-01' } },
    });

    await purchaseRepository.create({
      nf_number: 'NF-002',
      supplier: { connect: { id: 'supplier-02' } },
      user: { connect: { id: 'user-02' } },
    });

    // Act: Executa o serviço
    const { purchase } = await sut.execute();

    // Assert: Verifica se todas as compras foram retornadas
    expect(purchase).toHaveLength(2);
    expect(purchase[0].nf_number).toEqual('NF-001');
    expect(purchase[1].nf_number).toEqual('NF-002');
  });

  it('should return an empty array when there are no purchases', async () => {
    // Act: Executa o serviço com o repositório vazio
    const { purchase } = await sut.execute();

    // Assert: Verifica se um array vazio é retornado
    expect(purchase).toHaveLength(0);
  });
});
