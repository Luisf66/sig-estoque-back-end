import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { FindPurchaseByIdService } from './find-purchase-by-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let purchaseRepository: InMemoryPurchaseRepository;
let findPurchaseByIdService: FindPurchaseByIdService;

describe('FindPurchaseByIdService', () => {
  beforeEach(() => {
    purchaseRepository = new InMemoryPurchaseRepository();
    findPurchaseByIdService = new FindPurchaseByIdService(purchaseRepository);
  });

  it('should find a purchase by id', async () => {
    const purchase = await purchaseRepository.create({
      nf_number: '12345',
      subTotal: 100,
      user: { connect: { id: 'some-user-id' } }, // Use um ID de usuário válido
      supplier: { connect: { id: 'some-supplier-id' } }, // Use um ID de fornecedor válido
    });

    const response = await findPurchaseByIdService.execute({
      purchaseId: purchase.id,
    });

    expect(response.purchase).toBeDefined();
    expect(response.purchase.id).toBe(purchase.id);
    expect(response.purchase.nf_number).toBe('12345');
  });

  it('should throw ResourceNotFoundError if purchase does not exist', async () => {
    await expect(
      findPurchaseByIdService.execute({ purchaseId: 'non-existent-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});