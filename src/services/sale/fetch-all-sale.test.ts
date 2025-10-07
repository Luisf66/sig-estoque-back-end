import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySaleRepository } from '../../repositories/in-memory/in-memory-sale-repository';
import { FetchAllSaleService } from './fetch-all-sale';

// Declaração das variáveis
let saleRepository: InMemorySaleRepository;
let sut: FetchAllSaleService; // SUT: System Under Test

describe('Fetch All Sale Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    saleRepository = new InMemorySaleRepository();
    sut = new FetchAllSaleService(saleRepository);
  });

  it('should be able to fetch all sales', async () => {
    // Arrange: Cria algumas vendas de exemplo
    await saleRepository.create({
      nf_number: 'NF-SALE-01',
      user: { connect: { id: 'user-01' } },
    });

    await saleRepository.create({
      nf_number: 'NF-SALE-02',
      user: { connect: { id: 'user-02' } },
    });

    // Act: Executa o serviço
    const { sale } = await sut.execute();

    // Assert: Verifica se todas as vendas foram retornadas
    expect(sale).toHaveLength(2);
    expect(sale[0].nf_number).toEqual('NF-SALE-01');
  });

  it('should return an empty array when there are no sales', async () => {
    // Act: Executa o serviço com o repositório vazio
    const { sale } = await sut.execute();

    // Assert: Verifica se um array vazio é retornado
    expect(sale).toHaveLength(0);
  });
});
