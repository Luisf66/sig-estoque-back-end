import { describe, it, expect, beforeEach } from "vitest";
import { hash } from "bcryptjs";
import { UserAuthenticateService } from "./user-authenticate";
import { InvalidCredentialError } from "../errors/invalid-credential-error";
import { User } from "@prisma/client";
import { UserRepository } from "../../repositories/user-repository";

// Repositório em memória para testes
class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(data: any) {
    const user = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    this.items.push(user);
    return user;
  }

  async findByEmail(email: string) {
    return this.items.find((item) => item.email === email) ?? null;
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findMany() {
    return this.items;
  }

  async delete(id: string) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null as any;
    const [deleted] = this.items.splice(index, 1);
    return deleted;
  }

  async update(id: string, data: Partial<User>) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...data, updatedAt: new Date() };
    return this.items[index];
  }
}

describe("UserAuthenticateService", () => {
  let userRepository: InMemoryUserRepository;
  let sut: UserAuthenticateService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new UserAuthenticateService(userRepository);
  });

  it("deve autenticar o usuário com credenciais corretas", async () => {
    const password_hash = await hash("senha-secreta", 6);

    const createdUser = await userRepository.create({
      name: "Usuário Teste",
      email: "user@example.com",
      password_hash,
    });

    const { user } = await sut.execute({
      email: "user@example.com",
      password: "senha-secreta",
    });

    expect(user).toEqual(expect.objectContaining({ id: createdUser.id }));
    expect(user.email).toBe("user@example.com");
  });

  it("deve lançar InvalidCredentialError se o e-mail não existir", async () => {
    await expect(
      sut.execute({
        email: "naoexiste@example.com",
        password: "qualquer",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialError);
  });

  it("deve lançar InvalidCredentialError se a senha estiver incorreta", async () => {
    const password_hash = await hash("senha-correta", 6);

    await userRepository.create({
      name: "Usuário Teste",
      email: "user@example.com",
      password_hash,
    });

    await expect(
      sut.execute({
        email: "user@example.com",
        password: "senha-errada",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialError);
  });

  it("deve listar todos os usuários com findMany", async () => {
    await userRepository.create({
      name: "User 1",
      email: "user1@example.com",
      password_hash: await hash("123456", 6),
    });
    await userRepository.create({
      name: "User 2",
      email: "user2@example.com",
      password_hash: await hash("abcdef", 6),
    });

    const users = await userRepository.findMany();
    expect(users.length).toBe(2);
    expect(users[1].email).toBe("user2@example.com");
  });

  it("deve encontrar um usuário pelo ID usando findById", async () => {
    const user = await userRepository.create({
      name: "Find By Id",
      email: "findbyid@example.com",
      password_hash: await hash("123", 6),
    });

    const found = await userRepository.findById(user.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(user.id);
  });

  it("deve retornar null ao buscar ID inexistente", async () => {
    const found = await userRepository.findById("id-invalido");
    expect(found).toBeNull();
  });

  it("deve atualizar um usuário existente", async () => {
    const user = await userRepository.create({
      name: "Antigo",
      email: "old@example.com",
      password_hash: await hash("x", 6),
    });

    const updated = await userRepository.update(user.id, { name: "Novo" });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Novo");
  });

  it("deve retornar null ao tentar atualizar usuário inexistente", async () => {
    const updated = await userRepository.update("id-invalido", { name: "X" });
    expect(updated).toBeNull();
  });

  it("deve deletar um usuário existente", async () => {
    const user = await userRepository.create({
      name: "Delete Me",
      email: "delete@example.com",
      password_hash: await hash("y", 6),
    });

    const deleted = await userRepository.delete(user.id);
    expect(deleted).not.toBeNull();
    expect(deleted?.id).toBe(user.id);

    const remaining = await userRepository.findMany();
    expect(remaining.length).toBe(0);
  });

  it("deve retornar null ao tentar deletar usuário inexistente", async () => {
    const deleted = await userRepository.delete("id-invalido");
    expect(deleted).toBeNull();
  });

  it("deve encontrar um usuário pelo email com findByEmail", async () => {
    const createdUser = await userRepository.create({
      name: "Email Test",
      email: "emailtest@example.com",
      password_hash: await hash("abc", 6),
    });

    const found = await userRepository.findByEmail("emailtest@example.com");
    expect(found).not.toBeNull();
    expect(found?.id).toBe(createdUser.id);
  });

  it("deve retornar null ao buscar por email inexistente", async () => {
    const found = await userRepository.findByEmail("naoexiste@example.com");
    expect(found).toBeNull();
  });
});
