import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { InMemoryItemRepository } from '../../repositories/in-memory/in-memory-item-repository';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { CreatePurchaseService } from './create-purchase';

// Declaração das variáveis
let purchaseRepository: InMemoryPurchaseRepository;
let itemRepository: InMemoryItemRepository;
let productRepository: InMemoryProductsRepository;
let sut: CreatePurchaseService; // SUT: System Under Test

describe('Create Purchase Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    purchaseRepository = new InMemoryPurchaseRepository();
    itemRepository = new InMemoryItemRepository();
    productRepository = new InMemoryProductsRepository();
    sut = new CreatePurchaseService(purchaseRepository, itemRepository, productRepository);
  });

  it('should be able to create a new purchase and increase product stock', async () => {
    // Arrange: Cria produtos que farão parte da compra
    const product1 = await productRepository.create({
      name: 'Product A',
      price: 10,
      quantity_in_stock: 50,
    });

    const product2 = await productRepository.create({
      name: 'Product B',
      price: 25,
      quantity_in_stock: 30,
    });

    // Act: Executa o serviço de criação de compra
    const { newPurchase, items } = await sut.handle({
      nf_number: 'NF-12345',
      supplierId: 'supplier-01',
      userId: 'user-01',
      items: [
        { productId: product1.id, quantity: 10, value: 10 },
        { productId: product2.id, quantity: 5, value: 25 },
      ],
    });

    // Assert
    // Verifica se a compra e os itens foram criados
    expect(newPurchase.id).toEqual(expect.any(String));
    expect(items).toHaveLength(2);

    // Verifica se o subtotal foi calculado e atualizado corretamente
    // 10 (qtd) * 10 (val) + 5 (qtd) * 25 (val) = 100 + 125 = 225
    expect(newPurchase.subTotal).toEqual(225);

    // Verifica se o estoque dos produtos foi aumentado
    const updatedProduct1 = await productRepository.findById(product1.id);
    const updatedProduct2 = await productRepository.findById(product2.id);
    expect(updatedProduct1?.quantity_in_stock).toEqual(60); // 50 + 10
    expect(updatedProduct2?.quantity_in_stock).toEqual(35); // 30 + 5
  });

  it('should throw an error if a product is not found', async () => {
    // Arrange
    const product1 = await productRepository.create({ name: 'Product A', price: 10 });

    // Act & Assert: Tenta criar uma compra com um produto que não existe
    await expect(() =>
      sut.handle({
        nf_number: 'NF-Error',
        supplierId: 'supplier-01',
        userId: 'user-01',
        items: [
          { productId: product1.id, quantity: 1, value: 10 },
          { productId: 'non-existing-product-id', quantity: 1, value: 20 },
        ],
      })
    ).rejects.toThrow('Product not found');
  });

  it('should throw an error if a product is inactive', async () => {
    // Arrange: Cria um produto e o inativa
    const product1 = await productRepository.create({ name: 'Inactive Product', price: 10 });
    await productRepository.inactivate(product1.id);

    // Act & Assert: Tenta criar uma compra com um produto inativo
    await expect(() =>
      sut.handle({
        nf_number: 'NF-Error-Inactive',
        supplierId: 'supplier-01',
        userId: 'user-01',
        items: [{ productId: product1.id, quantity: 1, value: 10 }],
      })
    ).rejects.toThrow(`Product ${product1.name} does not exist or is inactive`);
  });
});
