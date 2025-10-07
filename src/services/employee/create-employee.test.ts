import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryEmployeesRepository } from '../../repositories/in-memory/in-memory-employee-repository';
import { CreateEmployeeService } from './create-employee';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';

// Declaração das variáveis para serem acessíveis em todos os testes do bloco
let employeesRepository: InMemoryEmployeesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: CreateEmployeeService; // SUT: System Under Test

describe('Create Employee Service', () => {
  beforeEach(() => {
    // Para cada teste, criamos novas instâncias dos repositórios e do service.
    // Isso garante que um teste não interfira no outro.
    employeesRepository = new InMemoryEmployeesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new CreateEmployeeService(employeesRepository, usersRepository);
  });

  it('should be able to create a new employee', async () => {
    // Act: Executa o método principal do service
    const { employee } = await sut.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    // Assert: Verifica se o resultado é o esperado
    expect(employee.id).toEqual(expect.any(String));
    // Verifica se o usuário e o funcionário foram criados nos repositórios
    expect(usersRepository.items).toHaveLength(1);
    expect(employeesRepository.items).toHaveLength(1);
    expect(usersRepository.items[0].email).toEqual('john.doe@example.com');
  });

  it('should hash the user password upon creation', async () => {
    // Act
    await sut.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    // Assert
    const createdUser = usersRepository.items[0];
    // Verifica que a senha armazenada no usuário não é a senha em texto plano
    expect(createdUser.password_hash).not.toEqual('password123');
  });

  it('should not be able to create an employee with an existing email', async () => {
    // Arrange: Primeiro, cria um usuário com um e-mail específico.
    await usersRepository.create({
      name: 'Jane Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_123'
    });

    // Act & Assert: Tenta criar um funcionário com o mesmo e-mail
    // e espera que o método rejeite a promessa com o erro correto.
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password456',
      })
    ).rejects.toThrow(new Error("Email already exists."));
  });
});