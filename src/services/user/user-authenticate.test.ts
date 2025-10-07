import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { UserAuthenticateService } from './user-authenticate';
import { InvalidCredentialError } from '../errors/invalid-credential-error';
import { hash } from 'bcryptjs';

// Declaração das variáveis
let usersRepository: InMemoryUsersRepository;
let sut: UserAuthenticateService; // SUT: System Under Test

describe('User Authenticate Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    usersRepository = new InMemoryUsersRepository();
    sut = new UserAuthenticateService(usersRepository);
  });

  it('should be able to authenticate a user', async () => {
    // Arrange: Cria um usuário com uma senha criptografada
    await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await hash('password123', 6),
      role: 'EMPLOYEE',
    });

    // Act: Executa o serviço com as credenciais corretas
    const { user } = await sut.execute({
      email: 'john.doe@example.com',
      password: 'password123',
    });

    // Assert: Verifica se o ID do usuário retornado é válido
    expect(user.id).toEqual(expect.any(String));
  });

  it('should not be able to authenticate with wrong email', async () => {
    // Act & Assert: Tenta autenticar com um e-mail que não existe
    await expect(() =>
      sut.execute({
        email: 'non-existing@example.com',
        password: 'password123',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialError);
  });

  it('should not be able to authenticate with wrong password', async () => {
    // Arrange: Cria um usuário
    await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await hash('password123', 6),
      role: 'EMPLOYEE',
    });

    // Act & Assert: Tenta autenticar com a senha errada
    await expect(() =>
      sut.execute({
        email: 'john.doe@example.com',
        password: 'wrong_password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialError);
  });
});
