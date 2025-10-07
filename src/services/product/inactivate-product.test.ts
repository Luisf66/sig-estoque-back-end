import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { InactivateProductService } from './inactivate-product';

// Declaração das variáveis
let productsRepository: InMemoryProductsRepository;
let sut: InactivateProductService; // SUT: System Under Test

describe('Inactivate Product Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    productsRepository = new InMemoryProductsRepository();
    sut = new InactivateProductService(productsRepository);
  });

  it('should be able to inactivate a product', async () => {
    // Arrange: Cria um produto para ser inativado
    const createdProduct = await productsRepository.create({
      name: 'Product to Inactivate',
      description: 'A test product',
      price: 50,
      quantity_in_stock: 100,
      batch: 'B1'
    });

    // Act: Executa o serviço com o ID do produto criado
    await sut.execute({ productId: createdProduct.id });

    // Assert: Verifica se o produto foi marcado como inativo no repositório
    const productInDb = await productsRepository.findById(createdProduct.id);
    expect(productInDb?.is_active).toBe(false);
  });

  it('should throw an error if the product does not exist', async () => {
    // Act & Assert: Tenta inativar um produto com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ productId: 'non-existing-id' })
    ).rejects.toThrow('Product not found');
  });
});
