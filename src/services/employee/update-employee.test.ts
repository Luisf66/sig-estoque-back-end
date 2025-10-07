import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryEmployeesRepository } from '../../repositories/in-memory/in-memory-employee-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { UpdateEmployeeService } from './update-employee';

// Declaração das variáveis
let employeesRepository: InMemoryEmployeesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: UpdateEmployeeService; // SUT: System Under Test

describe('Update Employee Service', () => {
  beforeEach(() => {
    // Instancia os repositórios e o serviço antes de cada teste
    employeesRepository = new InMemoryEmployeesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new UpdateEmployeeService(employeesRepository, usersRepository);
  });

  it('should be able to update an employee without changing the password', async () => {
    // Arrange: Cria um usuário e um funcionário para o teste
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'initial_hashed_password'
    });

    await employeesRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com novos dados, mas sem a senha
    await sut.execute({
      userId: user.id,
      name: 'John Doe Updated',
      email: 'john.doe.updated@example.com',
    });
    
    // Assert: Verifica se os dados do usuário foram atualizados corretamente
    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.name).toEqual('John Doe Updated');
    expect(updatedUser?.email).toEqual('john.doe.updated@example.com');
    // A senha não deve ter sido alterada
    expect(updatedUser?.password_hash).toEqual('initial_hashed_password');
  });

  it('should be able to update an employee including the password', async () => {
    // Arrange
    const user = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password_hash: 'old_hashed_password'
    });

    await employeesRepository.create({
      user: { connect: { id: user.id } }
    });

    // Act: Executa o serviço com novos dados, incluindo uma nova senha
    await sut.execute({
      userId: user.id,
      name: 'Jane Doe Updated',
      email: 'jane.doe.updated@example.com',
      password: 'new_password_123'
    });

    // Assert
    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.name).toEqual('Jane Doe Updated');
    // A nova senha deve ser diferente da antiga e não deve ser o texto plano
    expect(updatedUser?.password_hash).not.toEqual('old_hashed_password');
    expect(updatedUser?.password_hash).not.toEqual('new_password_123');
  });

  it('should throw an error if the user is not found', async () => {
    // Act & Assert: Tenta atualizar um usuário com um ID que não existe e espera um erro
    await expect(() => 
      sut.execute({
        userId: 'non-existing-user-id',
        name: 'Test',
        email: 'test@example.com',
      })
    ).rejects.toThrow();
  });
});
