import { describe, it, expect, beforeEach } from "vitest";
import { UpdateManagerService } from "../manager/update-manager";
import { InMemoryManagersRepository } from "../../repositories/in-memory/in-memory-manager-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";
import { NoRecordsFoundError } from "../../services/errors/no-records-found-error";
import { hash } from "bcryptjs";

describe("UpdateManagerService", () => {
  let managersRepository: InMemoryManagersRepository;
  let usersRepository: InMemoryUsersRepository;
  let sut: UpdateManagerService;

  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new UpdateManagerService(managersRepository, usersRepository);
  });

  it("deve atualizar os dados de um gerente existente (sem alterar senha)", async () => {
    // Cria um usuário inicial
    const user = await usersRepository.create({
      name: "Gerente Antigo",
      email: "old@example.com",
      password_hash: await hash("senha123", 6),
      role: "MANAGER",
    });

    // Cria um manager usando o formato esperado pelo repositório
    const manager = await managersRepository.create({
      user: {
        connect: {
          id: user.id,
        },
      },
    });

    // Executa o serviço de atualização
    const response = await sut.execute({
      userId: user.id,
      name: "Gerente Atualizado",
      email: "novo@example.com",
    });

    // Verifica se o manager retornado tem os dados corretos
    expect(response.manager).toEqual(
      expect.objectContaining({
        id: manager.id,
        userId: user.id,
      })
    );

    // Verifica se os dados do usuário foram atualizados
    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.name).toBe("Gerente Atualizado");
    expect(updatedUser?.email).toBe("novo@example.com");
    expect(updatedUser?.password_hash).toBe(user.password_hash);
  });

  it("deve atualizar os dados de um gerente existente e alterar a senha", async () => {
    // Cria usuário e manager
    const user = await usersRepository.create({
      name: "Gerente",
      email: "manager@example.com",
      password_hash: await hash("senha123", 6),
      role: "MANAGER",
    });

    await managersRepository.create({
      user: {
        connect: {
          id: user.id,
        },
      },
    });

    // Executa atualização com nova senha
    const response = await sut.execute({
      userId: user.id,
      name: "Gerente Atualizado",
      email: "manager@novo.com",
      password: "novaSenha",
    });

    expect(response.manager.userId).toBe(user.id);

    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.email).toBe("manager@novo.com");
    expect(updatedUser?.name).toBe("Gerente Atualizado");
    // Verifica que o hash foi alterado
    expect(updatedUser?.password_hash).not.toBe(user.password_hash);
  });

  it("deve lançar erro se o usuário não existir", async () => {
    await expect(
      sut.execute({
        userId: "usuario-inexistente",
        name: "Teste",
        email: "teste@example.com",
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });

  it("deve lançar erro se o manager não existir", async () => {
    const user = await usersRepository.create({
      name: "Usuário Sem Manager",
      email: "semmanager@example.com",
      password_hash: await hash("123456", 6),
      role: "MANAGER",
    });

    await expect(
      sut.execute({
        userId: user.id,
        name: "Nome Novo",
        email: "novo@example.com",
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
