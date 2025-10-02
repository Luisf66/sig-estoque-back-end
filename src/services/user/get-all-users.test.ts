import { describe, it, expect, beforeEach } from "vitest";
import { GetAllUsersService } from "./get-all-users";
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

describe("GetAllUsersService", () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetAllUsersService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetAllUsersService(userRepository);
  });

  it("deve retornar todos os usuários cadastrados", async () => {
    const user1 = await userRepository.create({
      name: "Usuário 1",
      email: "user1@example.com",
      password_hash: "hash1",
    });

    const user2 = await userRepository.create({
      name: "Usuário 2",
      email: "user2@example.com",
      password_hash: "hash2",
    });

    const { users } = await sut.execute();

    expect(users).toHaveLength(2);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: user1.id }),
        expect.objectContaining({ id: user2.id }),
      ])
    );
  });

  it("deve retornar um array vazio se não houver usuários", async () => {
    const { users } = await sut.execute();

    expect(users).toHaveLength(0);
  });
});
