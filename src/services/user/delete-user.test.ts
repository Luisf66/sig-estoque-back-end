import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { DeleteUserService } from './delete-user';

// Declaração das variáveis
let usersRepository: InMemoryUsersRepository;
let sut: DeleteUserService; // SUT: System Under Test

describe('Delete User Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    usersRepository = new InMemoryUsersRepository();
    sut = new DeleteUserService(usersRepository);
  });

  it('should be able to delete a user', async () => {
    // Arrange: Cria um usuário para ser deletado
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password',
      role: 'EMPLOYEE',
    });

    // Act: Executa o serviço de exclusão
    const { user } = await sut.execute({ id: createdUser.id });

    // Assert: Verifica se o usuário retornado é o correto e se ele foi removido do repositório
    expect(user.id).toEqual(createdUser.id);
    expect(usersRepository.items.length).toBe(0);
  });

  it('should throw an error if the user is not found', async () => {
    // Act & Assert: Tenta deletar um usuário com um ID inexistente e espera um erro
    await expect(() =>
      sut.execute({ id: 'non-existing-id' })
    ).rejects.toThrow('User not found');
  });
});
