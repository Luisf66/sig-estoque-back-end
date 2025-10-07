import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { FetchAllProductService } from './fetch-all-product';

// Declaração das variáveis
let productsRepository: InMemoryProductsRepository;
let sut: FetchAllProductService; // SUT: System Under Test

describe('Fetch All Product Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    productsRepository = new InMemoryProductsRepository();
    sut = new FetchAllProductService(productsRepository);
  });

  it('should be able to fetch all products', async () => {
    // Arrange: Cria alguns produtos para serem encontrados
    await productsRepository.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 10,
      quantity_in_stock: 100,
      batch: 'B1'
    });
    await productsRepository.create({
      name: 'Product 2',
      description: 'Description 2',
      price: 20,
      quantity_in_stock: 200,
      batch: 'B2'
    });

    // Act: Executa o serviço
    const { product } = await sut.execute();

    // Assert: Verifica se a lista de produtos retornada está correta
    expect(product).toHaveLength(2);
    expect(product[0].name).toEqual('Product 1');
    expect(product[1].name).toEqual('Product 2');
  });

  it('should return an empty array when no products are found', async () => {
    // Act: Executa o serviço com o repositório vazio
    const { product } = await sut.execute();

    // Assert: Verifica se o resultado é uma lista vazia
    expect(product).toEqual([]);
  });
});
