import { describe, it, expect, beforeEach } from "vitest";
import { DeleteUserService } from "./delete-user";
import { UserRepository } from "../../repositories/user-repository";
import { User } from "@prisma/client";

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

describe("DeleteUserService", () => {
  let userRepository: InMemoryUserRepository;
  let sut: DeleteUserService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new DeleteUserService(userRepository);
  });

  it("deve deletar um usuário existente e retornar seus dados", async () => {
    const createdUser = await userRepository.create({
      name: "Usuário Teste",
      email: "teste@example.com",
      password_hash: "hash_senha",
    });

    const { user } = await sut.execute({ id: createdUser.id });

    expect(user).not.toBeNull();
    expect(user.id).toBe(createdUser.id);

    const userInRepo = await userRepository.findById(createdUser.id);
    expect(userInRepo).toBeNull();
  });

  it("deve retornar null ao tentar deletar um usuário inexistente", async () => {
    const { user } = await sut.execute({ id: "id-invalido" });

    expect(user).toBeNull();
  });
});
