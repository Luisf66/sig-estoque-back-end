import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { GetUserByIdService } from './get-user-by-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

// Declaração das variáveis
let usersRepository: InMemoryUsersRepository;
let sut: GetUserByIdService; // SUT: System Under Test

describe('Get User By Id Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    usersRepository = new InMemoryUsersRepository();
    sut = new GetUserByIdService(usersRepository);
  });

  it('should be able to get a user by id', async () => {
    // Arrange: Cria um usuário para ser buscado
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_1',
      role: 'EMPLOYEE',
    });

    // Act: Executa o serviço
    const { user } = await sut.execute({ userId: createdUser.id });

    // Assert: Verifica se o usuário retornado é o correto
    expect(user.id).toEqual(createdUser.id);
    expect(user.name).toEqual('John Doe');
  });

  it('should throw an error if the user is not found', async () => {
    // Act & Assert: Tenta buscar um usuário com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ userId: 'non-existing-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
