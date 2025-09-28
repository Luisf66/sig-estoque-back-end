import { describe, it, expect, beforeEach } from "vitest";
import { UpdateEmployeeService } from "./update-employee";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";
import { InMemoryEmployeesRepository } from "../../repositories/in-memory/in-memory-employee-repository";
import { hash, compare } from "bcryptjs";

describe("UpdateEmployeeService", () => {
  let usersRepository: InMemoryUsersRepository;
  let employeesRepository: InMemoryEmployeesRepository;
  let sut: UpdateEmployeeService;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    employeesRepository = new InMemoryEmployeesRepository();
    sut = new UpdateEmployeeService(employeesRepository, usersRepository);
  });

  it("deve atualizar os dados do funcionário com nova senha", async () => {
    const passwordHash = await hash("123456", 6);

    const user = await usersRepository.create({
      name: "João",
      email: "joao@example.com",
      role: "EMPLOYEE",
      password_hash: passwordHash,
    });

    await employeesRepository.create({
      user: { connect: { id: user.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await sut.execute({
      userId: user.id,
      name: "João Atualizado",
      email: "joao.atualizado@example.com",
      password: "novaSenha123",
    });

    const updatedUser = await usersRepository.findById(user.id);

    expect(result.employee.userId).toBe(user.id);
    expect(updatedUser?.name).toBe("João Atualizado");
    expect(updatedUser?.email).toBe("joao.atualizado@example.com");
    expect(await compare("novaSenha123", updatedUser!.password_hash)).toBe(true);
  });

  it("deve atualizar os dados do funcionário sem alterar a senha", async () => {
    const passwordHash = await hash("senhaOriginal", 6);

    const user = await usersRepository.create({
      name: "Maria",
      email: "maria@example.com",
      role: "EMPLOYEE",
      password_hash: passwordHash,
    });

    await employeesRepository.create({
      user: { connect: { id: user.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await sut.execute({
      userId: user.id,
      name: "Maria Atualizada",
      email: "maria.atualizada@example.com",
    });

    const updatedUser = await usersRepository.findById(user.id);

    expect(result.employee.userId).toBe(user.id);
    expect(updatedUser?.name).toBe("Maria Atualizada");
    expect(updatedUser?.email).toBe("maria.atualizada@example.com");
    expect(await compare("senhaOriginal", updatedUser!.password_hash)).toBe(true);
  });

  it("deve lançar erro se o usuário não for encontrado", async () => {
    await expect(() =>
      sut.execute({
        userId: "user-inexistente",
        name: "Teste",
        email: "teste@example.com",
      })
    ).rejects.toThrowError("User not found.");
  });
});
