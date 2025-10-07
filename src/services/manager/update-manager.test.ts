import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryManagersRepository } from '../../repositories/in-memory/in-memory-manager-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { UpdateManagerService } from './update-manager';
import { NoRecordsFoundError } from '../errors/no-records-found-error';

// Declaração das variáveis
let managersRepository: InMemoryManagersRepository;
let usersRepository: InMemoryUsersRepository;
let sut: UpdateManagerService; // SUT: System Under Test

describe('Update Manager Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new UpdateManagerService(managersRepository, usersRepository);
  });

  it('should be able to update a manager', async () => {
    // Arrange: Cria um usuário e um gerente para serem atualizados
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_1'
    });

    await managersRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com os novos dados
    await sut.execute({
      userId: user.id,
      name: 'John Doe Updated',
      email: 'john.doe.updated@example.com',
    });

    // Assert: Verifica se os dados do usuário foram atualizados no repositório
    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.name).toEqual('John Doe Updated');
    expect(updatedUser?.email).toEqual('john.doe.updated@example.com');
  });

  it('should be able to update a manager with a new password', async () => {
    // Arrange
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_1'
    });

    await managersRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act
    await sut.execute({
      userId: user.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'new_password_123',
    });

    // Assert
    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.password_hash).not.toEqual('hashed_password_1');
  });

  it('should throw an error if the user is not found', async () => {
    // Act & Assert: Tenta atualizar um gerente com um userId inexistente
    await expect(() =>
      sut.execute({
        userId: 'non-existing-user-id',
        name: 'Any Name',
        email: 'any.email@example.com',
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });

  it('should throw an error if the manager profile is not found for the user', async () => {
    // Arrange: Cria um usuário, mas não um gerente associado a ele
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_1'
    });

    // Act & Assert: Tenta atualizar, mas o serviço não encontrará o perfil de gerente
    await expect(() =>
      sut.execute({
        userId: user.id,
        name: 'Any Name',
        email: 'any.email@example.com',
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
