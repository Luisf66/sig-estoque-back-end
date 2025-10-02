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
});
