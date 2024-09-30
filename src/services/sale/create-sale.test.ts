import { beforeEach, describe, it, expect, vi } from 'vitest';
import { CreateSaleService } from './create-sale';
import { InMemorySaleRepository } from '../../repositories/in-memory/in-memory-sale-repository';
import { InMemoryItemRepository } from '../../repositories/in-memory/in-memory-item-repository';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';

let saleRepository: InMemorySaleRepository;
let itemRepository: InMemoryItemRepository;
let productRepository: InMemoryProductsRepository;
let sut: CreateSaleService;

describe('Create Sale Service', () => {
  beforeEach(() => {
    saleRepository = new InMemorySaleRepository();
    itemRepository = new InMemoryItemRepository();
    productRepository = new InMemoryProductsRepository();
    sut = new CreateSaleService(saleRepository, itemRepository, productRepository);
  });

  it('should be able to create a new sale', async () => {
    // Cria produtos no repositório
    const product1 = await productRepository.create({
      id: 'product1',
      name: 'Product 1',
      description: 'Product 1 description',
      price: 100,
      quantity_in_stock: 10,
      batch: 'ABC123',
      is_active: true,
    });

    const product2 = await productRepository.create({
      id: 'product2',
      name: 'Product 2',
      description: 'Product 2 description',
      price: 150,
      quantity_in_stock: 5,
      batch: 'DEF456',
      is_active: true,
    });

    // Debug: Exibir informações dos produtos criados
    console.log("Produtos criados:", product1, product2);

    const { newSale, items } = await sut.handle({
      nf_number: 'NF123456',
      userId: 'user1',
      items: [
        {
          productId: product1.id,
          quantity: 2,
          value: 100,
        },
        {
          productId: product2.id,
          quantity: 1,
          value: 150,
        },
      ],
    });

    expect(newSale.id).toEqual(expect.any(String));
    expect(newSale.nf_number).toBe('NF123456');
    expect(newSale.subTotal).toBe(350);
    expect(items.length).toBe(2);
    expect(items[0].productId).toBe(product1.id);
    expect(items[1].productId).toBe(product2.id);

    // Verifica se o estoque dos produtos foi atualizado corretamente
    const updatedProduct1 = await productRepository.findById(product1.id);
    const updatedProduct2 = await productRepository.findById(product2.id);

    // Debug: Exibir informações dos produtos atualizados
    console.log("Produtos atualizados:", updatedProduct1, updatedProduct2);

    expect(updatedProduct1?.quantity_in_stock).toBe(8);
    expect(updatedProduct2?.quantity_in_stock).toBe(4);
  });

  it('should throw an error if a product is not found', async () => {
    await expect(() =>
      sut.handle({
        nf_number: 'NF123456',
        userId: 'user1',
        items: [
          {
            productId: 'nonexistent-product',
            quantity: 1,
            value: 100,
          },
        ],
      })
    ).rejects.toThrow('Product not found');
  });

  it('should throw an error if a product is inactive', async () => {
    const inactiveProduct = await productRepository.create({
      id: 'inactiveProduct',
      name: 'Inactive Product',
      description: 'Inactive Product description',
      price: 100,
      quantity_in_stock: 10,
      batch: 'GHI789',
      is_active: false,
    });

    // Debug: Exibir informações do produto inativo
    console.log("Produto inativo criado:", inactiveProduct);

    await expect(() =>
      sut.handle({
        nf_number: 'NF123456',
        userId: 'user1',
        items: [
          {
            productId: inactiveProduct.id,
            quantity: 1,
            value: 100,
          },
        ],
      })
    ).rejects.toThrow(`Product ${inactiveProduct.name} is inactive`);
  });

  it('should throw an error if a stock product is null', async () => {
    const Product = await productRepository.create({
      id: 'ProductNull',
      name: 'Empty Product',
      description: 'Null Product description',
      price: 100,
      quantity_in_stock: null,
      batch: '158HTQ',
      is_active: true,
    });

    await expect(() =>
      sut.handle({
        nf_number: 'NF1234',
        userId: 'user1',
        items: [
          {
            productId: Product.id,
            quantity: 0,
            value: 100,
          },
        ],
      })
    ).rejects.toThrow(`Stock quantity for product ${Product.name} is undefined`);
  });


  it('should throw an error if there is insufficient stock', async () => {
    const product = await productRepository.create({
      id: 'product',
      name: 'Product',
      description: 'Product description',
      price: 100,
      quantity_in_stock: 1,
      batch: 'JKL012',
      is_active: true,
    });

    // Debug: Exibir informações do produto com estoque insuficiente
    console.log("Produto criado com estoque insuficiente:", product);

    await expect(() =>
      sut.handle({
        nf_number: 'NF123456',
        userId: 'user1',
        items: [
          {
            productId: product.id,
            quantity: 2,
            value: 100,
          },
        ],
      })
    ).rejects.toThrow(`Insufficient stock for product ${product.name}`);
  });
});
