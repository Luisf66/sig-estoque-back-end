import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { InMemorySuppliersRepository } from '../../repositories/in-memory/in-memory-supplier-repository';
import { FetchAllPurchaseBySupplierIdService } from './fetch-all-purchase-by-supplier-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let purchaseRepository: InMemoryPurchaseRepository;
let supplierRepository: InMemorySuppliersRepository;
let sut: FetchAllPurchaseBySupplierIdService; // SUT: System Under Test

describe('Fetch All Purchase by Supplier Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    purchaseRepository = new InMemoryPurchaseRepository();
    supplierRepository = new InMemorySuppliersRepository();
    sut = new FetchAllPurchaseBySupplierIdService(purchaseRepository, supplierRepository);
  });

  it('should be able to fetch all purchases from a specific supplier', async () => {
    // Arrange: Cria dois fornecedores e compras para ambos
    const supplier1 = await supplierRepository.create({
      social_name: 'Supplier One LTDA',
      company_name: 'Supplier One',
      cnpj: '11111111111111',
      phone_number: '111111111'
    });

    const supplier2 = await supplierRepository.create({
      social_name: 'Supplier Two LTDA',
      company_name: 'Supplier Two',
      cnpj: '22222222222222',
      phone_number: '222222222'
    });

    await purchaseRepository.create({
      nf_number: 'NF-001',
      supplier: { connect: { id: supplier1.id } },
      user: { connect: { id: 'user-01' } },
    });

    await purchaseRepository.create({
      nf_number: 'NF-002',
      supplier: { connect: { id: supplier1.id } },
      user: { connect: { id: 'user-02' } },
    });

    await purchaseRepository.create({
      nf_number: 'NF-003',
      supplier: { connect: { id: supplier2.id } },
      user: { connect: { id: 'user-01' } },
    });

    // Act: Executa o serviço buscando as compras do primeiro fornecedor
    const { purchases } = await sut.execute({ supplierId: supplier1.id });

    // Assert: Verifica se retornou apenas as compras do fornecedor correto
    expect(purchases).toHaveLength(2);
    expect(purchases[0].nf_number).toEqual('NF-001');
    expect(purchases[1].nf_number).toEqual('NF-002');
  });

  it('should throw an error if the supplier is not found', async () => {
    // Act & Assert: Tenta buscar compras de um fornecedor inexistente
    await expect(() =>
      sut.execute({ supplierId: 'non-existing-supplier-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return an empty array if the supplier has no purchases', async () => {
    // Arrange: Cria um fornecedor mas nenhuma compra para ele
    const supplier = await supplierRepository.create({
        social_name: 'Supplier No Purchases LTDA',
        company_name: 'Supplier No Purchases',
        cnpj: '33333333333333',
        phone_number: '333333333'
    });

    // Act
    const { purchases } = await sut.execute({ supplierId: supplier.id });

    // Assert
    expect(purchases).toHaveLength(0);
  });
});
