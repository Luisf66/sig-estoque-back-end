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
});
