import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySaleRepository } from '../../repositories/in-memory/in-memory-sale-repository';
import { FindSaleByIdService } from './find-sale-by-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let saleRepository: InMemorySaleRepository;
let sut: FindSaleByIdService; // SUT: System Under Test

describe('Find Sale By Id Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    saleRepository = new InMemorySaleRepository();
    sut = new FindSaleByIdService(saleRepository);
  });

  it('should be able to find a sale by id', async () => {
    // Arrange: Cria uma venda de exemplo
    const createdSale = await saleRepository.create({
      nf_number: 'NF-SALE-01',
      user: { connect: { id: 'user-01' } },
    });

    // Act: Executa o serviço com o ID da venda criada
    const { sale } = await sut.execute({ saleId: createdSale.id });

    // Assert: Verifica se a venda retornada é a correta
    expect(sale.id).toEqual(createdSale.id);
    expect(sale.nf_number).toEqual('NF-SALE-01');
  });

  it('should throw an error if the sale is not found', async () => {
    // Act & Assert: Tenta buscar uma venda com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ saleId: 'non-existing-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
