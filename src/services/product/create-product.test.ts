import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { CreateProductService } from './create-product';

// Declaração das variáveis
let productsRepository: InMemoryProductsRepository;
let sut: CreateProductService; // SUT: System Under Test

describe('Create Product Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    productsRepository = new InMemoryProductsRepository();
    sut = new CreateProductService(productsRepository);
  });

  it('should be able to create a new product', async () => {
    // Arrange: Define os dados do produto a ser criado
    const productData = {
      name: 'Resistor 10k Ohm',
      description: 'Resistor de filme de carbono',
      price: 0.50,
      quantity_in_stock: 1000,
      batch: 'A1B2C3D4'
    };

    // Act: Executa o serviço com os dados do produto
    const { product } = await sut.handle(productData);

    // Assert: Verifica se o produto foi criado corretamente
    expect(product.id).toEqual(expect.any(String));
    expect(product.name).toEqual('Resistor 10k Ohm');
    expect(productsRepository.items).toHaveLength(1);
    expect(productsRepository.items[0].id).toEqual(product.id);
  });
});
