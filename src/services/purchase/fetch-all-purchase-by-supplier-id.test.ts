import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { FetchAllPurchaseBySupplierIdService } from './fetch-all-purchase-by-supplier-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let purchaseRepository: InMemoryPurchaseRepository;
let supplierRepository: InMemorySuppliersRepository;
let fetchAllPurchaseBySupplierIdService: FetchAllPurchaseBySupplierIdService;

describe('FetchAllPurchaseBySupplierIdService', () => {
  beforeEach(() => {
    purchaseRepository = new InMemoryPurchaseRepository();
    supplierRepository = new InMemorySuppliersRepository();
    fetchAllPurchaseBySupplierIdService = new FetchAllPurchaseBySupplierIdService(
      purchaseRepository,
      supplierRepository
    );
  });

  it('should fetch all purchases by supplier id', async () => {
    const supplier = await supplierRepository.create({
      social_name: 'Fornecedor A',
      company_name: 'Fornecedor A LTDA',
      phone_number: '123456789',
      cnpj: '00.000.000/0000-00',
    });

    // Criação das compras usando o formato correto
    await purchaseRepository.create({
      nf_number: '12345',
      subTotal: 100,
      user: { connect: { id: 'some-user-id' } }, // Use um ID de usuário válido
      supplier: { connect: { id: supplier.id } },
    });

    await purchaseRepository.create({
      nf_number: '67890',
      subTotal: 200,
      user: { connect: { id: 'some-user-id' } }, // Use um ID de usuário válido
      supplier: { connect: { id: supplier.id } },
    });

    const response = await fetchAllPurchaseBySupplierIdService.execute({
      supplierId: supplier.id,
    });

    expect(response.purchases).toHaveLength(2);
    expect(response.purchases[0].supplierId).toBe(supplier.id);
    expect(response.purchases[1].supplierId).toBe(supplier.id);
  });

  it('should throw ResourceNotFoundError if supplier does not exist', async () => {
    await expect(
      fetchAllPurchaseBySupplierIdService.execute({ supplierId: 'non-existent-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
