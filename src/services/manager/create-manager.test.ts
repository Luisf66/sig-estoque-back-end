import { describe, it, expect, beforeEach } from "vitest";
import { CreateManagerService } from "./create-manager";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";
import { InMemoryManagersRepository } from "../../repositories/in-memory/in-memory-manager-repository";
import { UserAlreadyExistsError } from "../errors/user-already-exists-error";
import { compare } from "bcryptjs";

describe("CreateManagerService", () => {
  let usersRepository: InMemoryUsersRepository;
  let managersRepository: InMemoryManagersRepository;
  let sut: CreateManagerService;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    managersRepository = new InMemoryManagersRepository();
    sut = new CreateManagerService(managersRepository, usersRepository);
  });

  it("deve criar um novo gerente com sucesso", async () => {
    const result = await sut.execute({
      name: "João Gerente",
      email: "joao.gerente@example.com",
      password: "senhaSecreta",
    });

    expect(result.manager).toBeDefined();
    expect(result.manager.userId).toBeDefined();

    const createdUser = await usersRepository.findByEmail("joao.gerente@example.com");

    expect(createdUser).not.toBeNull();
    expect(createdUser?.name).toBe("João Gerente");
    expect(createdUser?.role).toBe("MANAGER");
    expect(await compare("senhaSecreta", createdUser!.password_hash)).toBe(true);
  });

  it("deve lançar erro ao tentar criar um gerente com email já existente", async () => {
    await usersRepository.create({
      name: "Maria",
      email: "maria@example.com",
      role: "MANAGER",
      password_hash: "qualquerhash",
    });

    await expect(() =>
      sut.execute({
        name: "Maria Gerente",
        email: "maria@example.com",
        password: "senha",
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
