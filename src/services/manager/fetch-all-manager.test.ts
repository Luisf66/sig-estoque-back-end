import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryManagersRepository } from '../../repositories/in-memory/in-memory-manager-repository';
import { FetchAllManagerService } from './fetch-all-manager';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis
let managersRepository: InMemoryManagersRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FetchAllManagerService; // SUT: System Under Test

describe('Fetch All Manager Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FetchAllManagerService(managersRepository);
  });

  it('should be able to fetch all managers', async () => {
    // Arrange: Cria alguns usuários e gerentes para o teste
    const user1 = await usersRepository.create({ name: 'User One', email: 'user1@example.com', password_hash: 'hash1' });
    const user2 = await usersRepository.create({ name: 'User Two', email: 'user2@example.com', password_hash: 'hash2' });

    await managersRepository.create({ user: { connect: { id: user1.id } } });
    await managersRepository.create({ user: { connect: { id: user2.id } } });

    // Act: Executa o serviço
    const { managers } = await sut.execute();

    // Assert: Verifica se a lista retornada contém 2 gerentes
    expect(managers).toHaveLength(2);
    expect(managers[0].userId).toEqual(user1.id);
    expect(managers[1].userId).toEqual(user2.id);
  });

  it('should return an empty array when there are no managers', async () => {
    // Act: Executa o serviço sem nenhum gerente cadastrado
    const { managers } = await sut.execute();

    // Assert: Verifica se a lista retornada está vazia
    expect(managers).toHaveLength(0);
  });
});
