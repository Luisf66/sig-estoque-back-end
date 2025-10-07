import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryEmployeesRepository } from '../../repositories/in-memory/in-memory-employee-repository';
import { FindEmployeeByIdService } from './find-employee-by-id';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis
let employeesRepository: InMemoryEmployeesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FindEmployeeByIdService; // SUT: System Under Test

describe('Find Employee By Id Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    employeesRepository = new InMemoryEmployeesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FindEmployeeByIdService(employeesRepository);
  });

  it('should be able to find an employee by id', async () => {
    // Arrange: Cria um usuário e um funcionário para o teste
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password'
    });

    const createdEmployee = await employeesRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com o ID do funcionário criado
    const { employee } = await sut.execute({ id: createdEmployee.id });

    // Assert: Verifica se o funcionário retornado não é nulo e tem o ID correto
    expect(employee).not.toBeNull();
    expect(employee?.id).toEqual(createdEmployee.id);
  });

  it('should return null if employee is not found', async () => {
    // Act: Tenta buscar um funcionário com um ID que não existe
    const { employee } = await sut.execute({ id: 'non-existing-id' });

    // Assert: Verifica se o resultado é nulo
    expect(employee).toBeNull();
  });
});
