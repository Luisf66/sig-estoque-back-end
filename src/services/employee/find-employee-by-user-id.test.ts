import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryEmployeesRepository } from '../../repositories/in-memory/in-memory-employee-repository';
import { FindEmployeeByUserId } from './find-employee-by-user-id';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis
let employeesRepository: InMemoryEmployeesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FindEmployeeByUserId; // SUT: System Under Test

describe('Find Employee By User Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    employeesRepository = new InMemoryEmployeesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FindEmployeeByUserId(employeesRepository);
  });

  it('should be able to find an employee by user id', async () => {
    // Arrange: Cria um usuário e um funcionário para o teste
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password'
    });

    await employeesRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com o ID do usuário criado
    const { employee } = await sut.execute({ userId: user.id });

    // Assert: Verifica se o funcionário retornado não é nulo e tem o userId correto
    expect(employee).not.toBeNull();
    expect(employee?.userId).toEqual(user.id);
  });

  it('should return null if employee is not found with the given user id', async () => {
    // Act: Tenta buscar um funcionário com um ID de usuário que não existe
    const { employee } = await sut.execute({ userId: 'non-existing-user-id' });

    // Assert: Verifica se o resultado é nulo
    expect(employee).toBeNull();
  });
});
