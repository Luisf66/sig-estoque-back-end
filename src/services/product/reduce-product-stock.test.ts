import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { ReduceProductStockService } from './reduce-product-stock';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let productsRepository: InMemoryProductsRepository;
let sut: ReduceProductStockService; // SUT: System Under Test

describe('Reduce Product Stock Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    productsRepository = new InMemoryProductsRepository();
    sut = new ReduceProductStockService(productsRepository);
  });

  it('should be able to reduce the stock of a product', async () => {
    // Arrange: Cria um produto com estoque inicial
    const createdProduct = await productsRepository.create({
      name: 'LED RGB',
      description: 'Diodo emissor de luz',
      price: 0.75,
      quantity_in_stock: 100,
      batch: 'L1'
    });

    // Act: Executa o serviço para reduzir o estoque
    await sut.execute({ productId: createdProduct.id, quantity: 20 });

    // Assert: Verifica se o estoque foi atualizado corretamente
    const updatedProduct = await productsRepository.findById(createdProduct.id);
    expect(updatedProduct?.quantity_in_stock).toEqual(80);
  });

  it('should throw an error if the product is not found', async () => {
    // Act & Assert: Tenta reduzir o estoque de um produto inexistente e espera um erro
    await expect(() =>
      sut.execute({ productId: 'non-existing-id', quantity: 10 })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw an error if there is insufficient stock', async () => {
    // Arrange: Cria um produto com estoque baixo
    const createdProduct = await productsRepository.create({
      name: 'Potenciômetro',
      description: 'Resistor variável',
      price: 2.50,
      quantity_in_stock: 5,
      batch: 'P1'
    });

    // Act & Assert: Tenta reduzir mais do que o estoque disponível e espera um erro
    await expect(() =>
      sut.execute({ productId: createdProduct.id, quantity: 10 })
    ).rejects.toThrow('Insufficient stock');
  });

  it('should throw an error if product stock information is missing', async () => {
    // Arrange: Cria um produto com estoque nulo
    const createdProduct = await productsRepository.create({
      name: 'Protoboard',
      description: 'Placa de ensaio',
      price: 15.00,
      quantity_in_stock: null, // Estoque nulo
      batch: 'PB1'
    });

    // Act & Assert: Tenta reduzir o estoque e espera um erro
    await expect(() =>
      sut.execute({ productId: createdProduct.id, quantity: 1 })
    ).rejects.toThrow('Product stock information is missing');
  });
});
