import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryManagersRepository } from '../../repositories/in-memory/in-memory-manager-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateManagerService } from './create-manager';
import { UserAlreadyExistsError } from '../errors/user-already-exists-error';

// Declaração das variáveis
let managersRepository: InMemoryManagersRepository;
let usersRepository: InMemoryUsersRepository;
let sut: CreateManagerService; // SUT: System Under Test

describe('Create Manager Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new CreateManagerService(managersRepository, usersRepository);
  });

  it('should be able to create a new manager', async () => {
    // Act: Executa o serviço para criar um novo gerente
    const { manager } = await sut.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    // Assert: Verifica se o gerente foi criado com um ID
    expect(manager.id).toEqual(expect.any(String));
    // Verifica se o usuário correspondente foi criado com o e-mail e role corretos
    const user = await usersRepository.findByEmail('john.doe@example.com');
    expect(user?.role).toEqual('MANAGER');
  });

  it('should hash the user password upon creation', async () => {
    // Act
    await sut.execute({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'password123',
    });

    // Assert
    const user = await usersRepository.findByEmail('jane.doe@example.com');
    // Verifica se a senha armazenada é diferente da senha em texto plano
    expect(user?.password_hash).not.toEqual('password123');
  });

  it('should not be able to create a manager with an existing email', async () => {
    // Arrange: Cria um usuário com um e-mail específico
    await usersRepository.create({
        name: 'Existing User',
        email: 'duplicate@example.com',
        password_hash: 'hashed_password'
    });

    // Act & Assert: Tenta criar um gerente com o mesmo e-mail e espera um erro
    await expect(() =>
      sut.execute({
        name: 'New Manager',
        email: 'duplicate@example.com',
        password: 'password456',
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
