import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryEmployeesRepository } from '../../repositories/in-memory/in-memory-employee-repository';
import { FetchAllEmployeeService } from './fetch-all-employee';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis
let employeesRepository: InMemoryEmployeesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FetchAllEmployeeService; // SUT: System Under Test

describe('Fetch All Employee Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    employeesRepository = new InMemoryEmployeesRepository();
    usersRepository = new InMemoryUsersRepository(); // Necessário para criar dados de teste
    sut = new FetchAllEmployeeService(employeesRepository);
  });

  it('should be able to fetch all employees', async () => {
    // Arrange: Cria dados de teste
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password'
    });

    const user2 = await usersRepository.create({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password_hash: 'hashed_password'
    });

    await employeesRepository.create({
      user: { connect: { id: user1.id } }
    });

    await employeesRepository.create({
        user: { connect: { id: user2.id } }
    });

    // Act: Executa o serviço
    const { employee } = await sut.execute();

    // Assert: Verifica se o resultado está correto
    expect(employee).toHaveLength(2);
    expect(employee[0].userId).toEqual(user1.id);
    expect(employee[1].userId).toEqual(user2.id);
  });

  it('should return an empty array when no employees are found', async () => {
    // Act: Executa o serviço com o repositório vazio
    const { employee } = await sut.execute();

    // Assert: Verifica se o resultado é uma lista vazia
    expect(employee).toHaveLength(0);
  });
});