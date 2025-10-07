import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryManagersRepository } from '../../repositories/in-memory/in-memory-manager-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { FindManagerByUserId } from './find-manager-by-user-id';

// Declaração das variáveis
let managersRepository: InMemoryManagersRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FindManagerByUserId; // SUT: System Under Test

describe('Find Manager By User Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FindManagerByUserId(managersRepository);
  });

  it('should be able to find a manager by user id', async () => {
    // Arrange: Cria um usuário e um gerente para serem encontrados
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password'
    });

    await managersRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com o ID do usuário criado
    const { manager } = await sut.execute({ userId: user.id });

    // Assert: Verifica se o gerente retornado é o correto
    expect(manager).not.toBeNull();
    expect(manager?.userId).toEqual(user.id);
  });

  it('should return null if no manager is found for the user id', async () => {
    // Act: Tenta buscar um gerente com um ID de usuário inexistente
    const { manager } = await sut.execute({ userId: 'non-existing-user-id' });

    // Assert: Verifica se o resultado é nulo
    expect(manager).toBeNull();
  });
});
