import { describe, it, expect, beforeEach } from "vitest";
import { GetUserByIdService } from "./get-user-by-id";
import { UserRepository } from "../../repositories/user-repository";
import { User } from "@prisma/client";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

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

describe("GetUserByIdService", () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetUserByIdService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetUserByIdService(userRepository);
  });

  it("deve retornar um usuário quando o ID for válido", async () => {
    const createdUser = await userRepository.create({
      name: "Usuário Teste",
      email: "user@example.com",
      password_hash: "hash",
    });

    const { user } = await sut.execute({ userId: createdUser.id });

    expect(user).toEqual(expect.objectContaining({ id: createdUser.id }));
    expect(user.name).toBe("Usuário Teste");
  });

  it("deve lançar ResourceNotFoundError se o usuário não existir", async () => {
    await expect(
      sut.execute({ userId: "non-existing-id" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve listar usuários usando findMany", async () => {
    await userRepository.create({
      name: "User 1",
      email: "user1@example.com",
      password_hash: "hash",
    });
    await userRepository.create({
      name: "User 2",
      email: "user2@example.com",
      password_hash: "hash",
    });

    const users = await userRepository.findMany();
    expect(users.length).toBe(2);
    expect(users[0].name).toBe("User 1");
  });

  it("deve atualizar um usuário existente", async () => {
    const user = await userRepository.create({
      name: "Old Name",
      email: "old@example.com",
      password_hash: "hash",
    });

    const updated = await userRepository.update(user.id, { name: "New Name" });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("New Name");
  });

  it("deve deletar um usuário existente", async () => {
    const user = await userRepository.create({
      name: "Delete Me",
      email: "delete@example.com",
      password_hash: "hash",
    });

    const deleted = await userRepository.delete(user.id);
    expect(deleted).not.toBeNull();
    expect(deleted?.id).toBe(user.id);

    const remaining = await userRepository.findMany();
    expect(remaining.length).toBe(0);
  });

  it("deve retornar null ao tentar atualizar usuário inexistente", async () => {
    const result = await userRepository.update("invalid-id", { name: "X" });
    expect(result).toBeNull();
  });

  it("deve retornar null ao tentar deletar usuário inexistente", async () => {
    const result = await userRepository.delete("invalid-id");
    expect(result).toBeNull();
  });

  it("deve encontrar um usuário pelo email usando findByEmail", async () => {
    const createdUser = await userRepository.create({
      name: "Find By Email",
      email: "find@example.com",
      password_hash: "hash",
    });

    const found = await userRepository.findByEmail("find@example.com");
    expect(found).not.toBeNull();
    expect(found?.id).toBe(createdUser.id);
  });

  it("deve retornar null ao buscar por email inexistente", async () => {
    const found = await userRepository.findByEmail("notfound@example.com");
    expect(found).toBeNull();
  });
});
