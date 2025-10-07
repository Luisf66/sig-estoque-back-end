import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryManagersRepository } from '../../repositories/in-memory/in-memory-manager-repository';
import { FindManagerByIdService } from './find-manager-by-id';
import { NoRecordsFoundError } from '../errors/no-records-found-error';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis
let managersRepository: InMemoryManagersRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FindManagerByIdService; // SUT: System Under Test

describe('Find Manager By Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository(); // Necessário para o contexto do gerente
    sut = new FindManagerByIdService(managersRepository);
  });

  it('should be able to find a manager by id', async () => {
    // Arrange: Cria um usuário e um gerente para serem encontrados
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password'
    });

    const createdManager = await managersRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com o ID do gerente criado
    const { manager } = await sut.execute({ id: createdManager.id });

    // Assert: Verifica se o gerente retornado é o correto
    expect(manager).not.toBeNull();
    expect(manager?.id).toEqual(createdManager.id);
  });

  it('should throw an error if the manager is not found', async () => {
    // Act & Assert: Tenta buscar um gerente com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ id: 'non-existing-id' })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
