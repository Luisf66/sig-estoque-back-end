import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { GetAllUsersService } from './get-all-users';

// Declaração das variáveis
let usersRepository: InMemoryUsersRepository;
let sut: GetAllUsersService; // SUT: System Under Test

describe('Get All Users Service', () => {
  beforeEach(() => {
    // Instancia o repositório e o serviço antes de cada teste
    usersRepository = new InMemoryUsersRepository();
    sut = new GetAllUsersService(usersRepository);
  });

  it('should be able to get all users', async () => {
    // Arrange: Cria alguns usuários para teste
    await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_1',
      role: 'EMPLOYEE',
    });
    await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password_hash: 'hashed_password_2',
      role: 'MANAGER',
    });

    // Act: Executa o serviço
    const { users } = await sut.execute();

    // Assert: Verifica se a lista retornada contém os dois usuários
    expect(users.length).toBe(2);
    expect(users[0].name).toEqual('John Doe');
    expect(users[1].name).toEqual('Jane Doe');
  });

  it('should return an empty array if no users are found', async () => {
    // Act: Executa o serviço com o repositório vazio
    const { users } = await sut.execute();

    // Assert: Verifica se a lista retornada está vazia
    expect(users.length).toBe(0);
  });
});
