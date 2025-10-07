import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySaleRepository } from '../../repositories/in-memory/in-memory-sale-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { FetchAllSaleByUserIdService } from './fetch-all-sale-by-user-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let saleRepository: InMemorySaleRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FetchAllSaleByUserIdService; // SUT: System Under Test

describe('Fetch All Sale By User Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    saleRepository = new InMemorySaleRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FetchAllSaleByUserIdService(saleRepository, usersRepository);
  });

  it('should be able to fetch all sales by user id', async () => {
    // Arrange: Cria um usuário e duas vendas associadas a ele
    const user = await usersRepository.create({
      id: 'user-01',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password'
    });

    await saleRepository.create({
      nf_number: 'NF-SALE-01',
      user: { connect: { id: user.id } },
    });

    await saleRepository.create({
      nf_number: 'NF-SALE-02',
      user: { connect: { id: user.id } },
    });

    // Cria outra venda para outro usuário para garantir que não seja retornada
    await saleRepository.create({
      nf_number: 'NF-SALE-03',
      user: { connect: { id: 'user-02' } },
    });

    // Act: Executa o serviço
    const { sales } = await sut.execute({ userId: user.id });

    // Assert: Verifica se apenas as vendas do usuário correto foram retornadas
    expect(sales).toHaveLength(2);
    expect(sales[0].nf_number).toEqual('NF-SALE-01');
    expect(sales[1].nf_number).toEqual('NF-SALE-02');
  });

  it('should return an empty array when the user has no sales', async () => {
    // Arrange: Cria um usuário sem vendas associadas
    const user = await usersRepository.create({
      id: 'user-01',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password_hash: 'hashed_password'
    });

    // Act: Executa o serviço
    const { sales } = await sut.execute({ userId: user.id });

    // Assert: Verifica se um array vazio é retornado
    expect(sales).toHaveLength(0);
  });

  it('should throw an error if the user is not found', async () => {
    // Act & Assert: Tenta buscar vendas de um usuário inexistente e espera um erro
    await expect(() =>
      sut.execute({ userId: 'non-existing-user-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
