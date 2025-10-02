import { describe, it, expect, beforeEach } from "vitest";
import { GetUserProfileService } from "./get-user-profile";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
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

describe("GetUserProfileService", () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetUserProfileService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetUserProfileService(userRepository);
  });

  it("deve retornar o perfil do usuário quando o ID for válido", async () => {
    const createdUser = await userRepository.create({
      name: "Usuário Teste",
      email: "user@example.com",
      password_hash: "hash",
    });

    const { user } = await sut.execute({ userId: createdUser.id });

    expect(user).toEqual(expect.objectContaining({ id: createdUser.id }));
    expect(user.name).toBe("Usuário Teste");
    expect(user.email).toBe("user@example.com");
  });

  it("deve lançar ResourceNotFoundError se o usuário não existir", async () => {
    await expect(
      sut.execute({ userId: "non-existing-id" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
