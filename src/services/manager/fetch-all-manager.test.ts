import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllManagerService } from "./fetch-all-manager";
import { InMemoryManagersRepository } from "../../repositories/in-memory/in-memory-manager-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";

describe("FetchAllManagerService", () => {
  let managersRepository: InMemoryManagersRepository;
  let usersRepository: InMemoryUsersRepository;
  let sut: FetchAllManagerService;

  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FetchAllManagerService(managersRepository);
  });

  it("deve retornar todos os gerentes cadastrados", async () => {
    const user1 = await usersRepository.create({
      name: "Gerente 1",
      email: "gerente1@example.com",
      password_hash: "hash1",
      role: "MANAGER",
    });

    const user2 = await usersRepository.create({
      name: "Gerente 2",
      email: "gerente2@example.com",
      password_hash: "hash2",
      role: "MANAGER",
    });

    await managersRepository.create({
      user: { connect: { id: user1.id } },
    });

    await managersRepository.create({
      user: { connect: { id: user2.id } },
    });

    const result = await sut.execute();

    expect(result.managers).toHaveLength(2);
    const ids = result.managers.map(m => m.userId);
    expect(ids).toContain(user1.id);
    expect(ids).toContain(user2.id);
  });

  it("deve retornar um array vazio se não houver gerentes", async () => {
    const result = await sut.execute();
    expect(result.managers).toEqual([]);
  });
});
