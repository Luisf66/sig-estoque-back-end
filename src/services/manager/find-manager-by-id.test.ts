import { describe, it, expect, beforeEach } from "vitest";
import { FindManagerByIdService } from "./find-manager-by-id";
import { InMemoryManagersRepository } from "../../repositories/in-memory/in-memory-manager-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";
import { NoRecordsFoundError } from "../errors/no-records-found-error";

describe("FindManagerByIdService", () => {
  let managersRepository: InMemoryManagersRepository;
  let usersRepository: InMemoryUsersRepository;
  let sut: FindManagerByIdService;

  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FindManagerByIdService(managersRepository);
  });

  it("deve encontrar um gerente pelo ID", async () => {
    const user = await usersRepository.create({
      name: "Gerente Teste",
      email: "gerente@example.com",
      password_hash: "hash123",
      role: "MANAGER",
    });

    const manager = await managersRepository.create({
      user: { connect: { id: user.id } },
    });

    const result = await sut.execute({ id: manager.id });

    expect(result.manager).toBeDefined();
    expect(result.manager?.id).toBe(manager.id);
    expect(result.manager?.userId).toBe(user.id);
  });

  it("deve lançar NoRecordsFoundError se o gerente não for encontrado", async () => {
    await expect(sut.execute({ id: "id-inexistente" }))
      .rejects
      .toBeInstanceOf(NoRecordsFoundError);
  });
});
