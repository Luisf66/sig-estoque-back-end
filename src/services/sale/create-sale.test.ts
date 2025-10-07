import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySaleRepository } from '../../repositories/in-memory/in-memory-sale-repository';
import { InMemoryItemRepository } from '../../repositories/in-memory/in-memory-item-repository';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { CreateSaleService } from './create-sale';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis
let saleRepository: InMemorySaleRepository;
let itemsRepository: InMemoryItemRepository;
let productsRepository: InMemoryProductsRepository;
let usersRepository: InMemoryUsersRepository;
let sut: CreateSaleService; // SUT: System Under Test

describe('Create Sale Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    saleRepository = new InMemorySaleRepository();
    itemsRepository = new InMemoryItemRepository();
    productsRepository = new InMemoryProductsRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new CreateSaleService(saleRepository, itemsRepository, productsRepository);
  });

  it('should be able to create a new sale', async () => {
    // Arrange: Cria um usuário e produtos com estoque suficiente
    const user = await usersRepository.create({ id: 'user-01', name: 'John Doe', email: 'john@doe.com', password_hash: '123' });
    const product1 = await productsRepository.create({ name: 'Product A', price: 10, quantity_in_stock: 20 });
    const product2 = await productsRepository.create({ name: 'Product B', price: 5, quantity_in_stock: 15 });

    // Act: Executa o serviço de criação de venda
    const { newSale, items } = await sut.handle({
      nf_number: 'NF-SALE-001',
      userId: user.id,
      items: [
        { productId: product1.id, quantity: 2, value: 10 },
        { productId: product2.id, quantity: 3, value: 5 },
      ],
    });

    // Assert
    const updatedProduct1 = await productsRepository.findById(product1.id);
    const updatedProduct2 = await productsRepository.findById(product2.id);

    // Verifica se a venda e os itens foram criados
    expect(newSale.id).toEqual(expect.any(String));
    expect(items).toHaveLength(2);
    // Verifica se o subtotal foi calculado e atualizado corretamente
    expect(newSale.subTotal).toEqual((2 * 10) + (3 * 5));
    // Verifica se o estoque dos produtos foi reduzido
    expect(updatedProduct1?.quantity_in_stock).toBe(18); // 20 - 2
    expect(updatedProduct2?.quantity_in_stock).toBe(12); // 15 - 3
  });

  it('should not be able to create a sale with a non-existing product', async () => {
    // Arrange
    const user = await usersRepository.create({ id: 'user-01', name: 'John Doe', email: 'john@doe.com', password_hash: '123' });
    const product1 = await productsRepository.create({ name: 'Product A', price: 10, quantity_in_stock: 20 });

    // Act & Assert: Tenta criar a venda com um produto que não existe
    await expect(() =>
      sut.handle({
        nf_number: 'NF-FAIL-01',
        userId: user.id,
        items: [
          { productId: product1.id, quantity: 1, value: 10 },
          { productId: 'non-existing-product-id', quantity: 1, value: 5 },
        ],
      })
    ).rejects.toThrow('Product not found');
  });

  it('should not be able to create a sale with an inactive product', async () => {
    // Arrange
    const user = await usersRepository.create({ id: 'user-01', name: 'John Doe', email: 'john@doe.com', password_hash: '123' });
    const inactiveProduct = await productsRepository.create({ name: 'Inactive Product', price: 10, quantity_in_stock: 20, is_active: false });

    // Act & Assert
    await expect(() =>
      sut.handle({
        nf_number: 'NF-FAIL-02',
        userId: user.id,
        items: [{ productId: inactiveProduct.id, quantity: 1, value: 10 }],
      })
    ).rejects.toThrow(`Product ${inactiveProduct.name} is inactive`);
  });

  it('should not be able to create a sale with insufficient stock', async () => {
    // Arrange
    const user = await usersRepository.create({ id: 'user-01', name: 'John Doe', email: 'john@doe.com', password_hash: '123' });
    const product = await productsRepository.create({ name: 'Limited Stock Product', price: 10, quantity_in_stock: 5 });

    // Act & Assert
    await expect(() =>
      sut.handle({
        nf_number: 'NF-FAIL-03',
        userId: user.id,
        items: [{ productId: product.id, quantity: 10, value: 10 }], // Pedindo 10, mas só tem 5
      })
    ).rejects.toThrow(`Insufficient stock for product ${product.name}`);
  });
});
