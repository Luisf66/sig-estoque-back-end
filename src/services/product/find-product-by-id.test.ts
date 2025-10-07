import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { FindProductByIdService } from './find-product-by-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InactiveError } from '../errors/inactive-error';

// Declaração das variáveis
let productsRepository: InMemoryProductsRepository;
let sut: FindProductByIdService; // SUT: System Under Test

describe('Find Product By Id Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    productsRepository = new InMemoryProductsRepository();
    sut = new FindProductByIdService(productsRepository);
  });

  it('should be able to find a product by its id', async () => {
    // Arrange: Cria um produto para ser encontrado
    const createdProduct = await productsRepository.create({
      name: 'Capacitor 100uF',
      description: 'Capacitor eletrolítico',
      price: 1.25,
      quantity_in_stock: 500,
      batch: 'E5F6G7H8'
    });

    // Act: Executa o serviço com o ID do produto criado
    const { product } = await sut.execute({ productId: createdProduct.id });

    // Assert: Verifica se o produto retornado é o correto
    expect(product.id).toEqual(createdProduct.id);
    expect(product.name).toEqual('Capacitor 100uF');
  });

  it('should throw an error if the product is not found', async () => {
    // Act & Assert: Tenta buscar um produto com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ productId: 'non-existing-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw an error if the found product is inactive', async () => {
    // Arrange: Cria um produto e o inativa
    const createdProduct = await productsRepository.create({
      name: 'Inactive Product',
      description: 'This product is inactive',
      price: 99,
      quantity_in_stock: 10,
      batch: 'I9J0K1L2'
    });

    await productsRepository.inactivate(createdProduct.id);

    // Act & Assert: Tenta buscar o produto inativo e espera um erro específico
    await expect(() =>
      sut.execute({ productId: createdProduct.id })
    ).rejects.toBeInstanceOf(InactiveError);
  });
});
