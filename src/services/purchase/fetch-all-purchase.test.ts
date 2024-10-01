import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { FetchAllPurchaseService } from './fetch-all-purchase';

let purchaseRepository: InMemoryPurchaseRepository;
let fetchAllPurchaseService: FetchAllPurchaseService;

describe('FetchAllPurchaseService', () => {
  beforeEach(() => {
    purchaseRepository = new InMemoryPurchaseRepository();
    fetchAllPurchaseService = new FetchAllPurchaseService(purchaseRepository);
  });

  it('should fetch all purchases', async () => {
    // Criação de compras usando o formato correto
    await purchaseRepository.create({
      nf_number: '12345',
      subTotal: 100,
      user: { connect: { id: 'some-user-id' } }, // Use um ID de usuário válido
      supplier: { connect: { id: 'some-supplier-id' } }, // Use um ID de fornecedor válido
    });

    await purchaseRepository.create({
      nf_number: '67890',
      subTotal: 200,
      user: { connect: { id: 'some-user-id' } },
      supplier: { connect: { id: 'some-supplier-id' } },
    });

    const response = await fetchAllPurchaseService.execute();

    expect(response.purchase).toHaveLength(2);
    expect(response.purchase[0].nf_number).toBe('12345');
    expect(response.purchase[1].nf_number).toBe('67890');
  });
  
  it('should return an empty array if no purchases exist', async () => {
    const response = await fetchAllPurchaseService.execute();

    expect(response.purchase).toHaveLength(0);
  });
});
