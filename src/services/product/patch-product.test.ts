import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductsRepository } from '../../repositories/in-memory/in-memory-products-repository';
import { PatchProductService } from './patch-product';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InactiveError } from '../errors/inactive-error';

// Declaração das variáveis
let productsRepository: InMemoryProductsRepository;
let sut: PatchProductService; // SUT: System Under Test

describe('Patch Product Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    productsRepository = new InMemoryProductsRepository();
    sut = new PatchProductService(productsRepository);
  });

  it('should be able to patch a product', async () => {
    // Arrange: Cria um produto para ser atualizado
    const createdProduct = await productsRepository.create({
      name: 'Resistor 10k',
      description: 'Resistor de filme de carbono',
      price: 0.10,
      quantity_in_stock: 1000,
      batch: 'R1'
    });

    // Act: Executa o serviço com novos dados parciais
    const { product } = await sut.handle({
      id: createdProduct.id,
      data: {
        name: 'Resistor 10k Ohm',
        price: 0.12,
      }
    });

    // Assert: Verifica se os campos foram atualizados e outros permaneceram iguais
    expect(product?.name).toEqual('Resistor 10k Ohm');
    expect(product?.price).toEqual(0.12);
    expect(product?.description).toEqual('Resistor de filme de carbono'); // Deve permanecer o mesmo
  });

  it('should throw an error if the product to patch is not found', async () => {
    // Act & Assert: Tenta atualizar um produto com um ID inexistente e espera um erro
    await expect(() =>
      sut.handle({
        id: 'non-existing-id',
        data: { name: 'New Name' }
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw an error if trying to patch an inactive product', async () => {
    // Arrange: Cria um produto e o inativa
    const createdProduct = await productsRepository.create({
      name: 'Old Transistor',
      description: 'An old model',
      price: 0.50,
      quantity_in_stock: 20,
      batch: 'T2'
    });

    await productsRepository.inactivate(createdProduct.id);

    // Act & Assert: Tenta atualizar o produto inativo e espera um erro específico
    await expect(() =>
      sut.handle({
        id: createdProduct.id,
        data: { price: 0.45 }
      })
    ).rejects.toBeInstanceOf(InactiveError);
  });
});
