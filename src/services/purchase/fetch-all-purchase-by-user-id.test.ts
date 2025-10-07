import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { FetchAllPurchaseByUserIdService } from './fetch-all-purchase-by-user-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let purchaseRepository: InMemoryPurchaseRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FetchAllPurchaseByUserIdService; // SUT: System Under Test

describe('Fetch All Purchase by User Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    purchaseRepository = new InMemoryPurchaseRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FetchAllPurchaseByUserIdService(purchaseRepository, usersRepository);
  });

  it('should be able to fetch all purchases from a specific user', async () => {
    // Arrange: Cria dois usuários e compras para ambos
    const user1 = await usersRepository.create({
      id: 'user-01',
      name: 'User One',
      email: 'userone@example.com',
      password_hash: 'hashed_password'
    });

    const user2 = await usersRepository.create({
      id: 'user-02',
      name: 'User Two',
      email: 'usertwo@example.com',
      password_hash: 'hashed_password'
    });

    await purchaseRepository.create({
      nf_number: 'NF-001',
      supplier: { connect: { id: 'supplier-01' } },
      user: { connect: { id: user1.id } },
    });

    await purchaseRepository.create({
      nf_number: 'NF-002',
      supplier: { connect: { id: 'supplier-02' } },
      user: { connect: { id: user1.id } },
    });

    await purchaseRepository.create({
      nf_number: 'NF-003',
      supplier: { connect: { id: 'supplier-01' } },
      user: { connect: { id: user2.id } },
    });

    // Act: Executa o serviço buscando as compras do primeiro usuário
    const { purchases } = await sut.execute({ userId: user1.id });

    // Assert: Verifica se retornou apenas as compras do usuário correto
    expect(purchases).toHaveLength(2);
    expect(purchases[0].nf_number).toEqual('NF-001');
    expect(purchases[1].nf_number).toEqual('NF-002');
  });

  it('should throw an error if the user is not found', async () => {
    // Act & Assert: Tenta buscar compras de um usuário inexistente
    await expect(() =>
      sut.execute({ userId: 'non-existing-user-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return an empty array if the user has no purchases', async () => {
    // Arrange: Cria um usuário mas nenhuma compra para ele
    const user = await usersRepository.create({
        id: 'user-no-purchases',
        name: 'User No Purchases',
        email: 'nouser@example.com',
        password_hash: 'hashed_password'
    });

    // Act
    const { purchases } = await sut.execute({ userId: user.id });

    // Assert
    expect(purchases).toHaveLength(0);
  });
});
