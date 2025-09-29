import { describe, it, expect, beforeEach } from "vitest";
import { FindManagerByUserId } from "./find-manager-by-user-id";
import { InMemoryManagersRepository } from "../../repositories/in-memory/in-memory-manager-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";

describe("FindManagerByUserId Service", () => {
  let managersRepository: InMemoryManagersRepository;
  let usersRepository: InMemoryUsersRepository;
  let sut: FindManagerByUserId;

  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FindManagerByUserId(managersRepository);
  });

  it("deve retornar o gerente correspondente ao userId", async () => {
    const user = await usersRepository.create({
      name: "Manager Test",
      email: "manager@example.com",
      password_hash: "hash123",
      role: "MANAGER",
    });

    const manager = await managersRepository.create({
      user: { connect: { id: user.id } },
    });

    const result = await sut.execute({ userId: user.id });

    expect(result.manager).toBeDefined();
    expect(result.manager?.id).toBe(manager.id);
    expect(result.manager?.userId).toBe(user.id);
  });

  it("deve retornar null se não existir gerente para o userId", async () => {
    const result = await sut.execute({ userId: "user-inexistente" });

    expect(result.manager).toBeNull();
  });
});
