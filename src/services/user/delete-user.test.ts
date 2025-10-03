import { describe, it, expect, beforeEach } from "vitest";
import { DeleteUserService } from "./delete-user";
import { UserRepository } from "../../repositories/user-repository";
import { User, ROLE } from "@prisma/client";

class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(data: any) {
    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role ?? ROLE.EMPLOYEE, // 👈 Adiciona a role obrigatória
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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

  // 👇 Corrigido para não conflitar com a interface original
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
      role: ROLE.ADMIN,
    });

    const { user } = await sut.execute({ id: createdUser.id });

    expect(user).not.toBeNull();
    expect(user?.id).toBe(createdUser.id);

    const userInRepo = await userRepository.findById(createdUser.id);
    expect(userInRepo).toBeNull();
  });

  it("deve retornar null ao tentar deletar um usuário inexistente", async () => {
    const { user } = await sut.execute({ id: "id-invalido" });
    expect(user).toBeNull();
  });

  it("deve encontrar usuário pelo email antes de deletar", async () => {
    const createdUser = await userRepository.create({
      name: "Busca Teste",
      email: "busca@example.com",
      password_hash: "senha",
      role: ROLE.USER,
    });

    const found = await userRepository.findByEmail(createdUser.email);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(createdUser.id);
  });

  it("deve retornar null ao tentar atualizar usuário inexistente", async () => {
    const result = await userRepository.update("id-invalido", { name: "Novo Nome" });
    expect(result).toBeNull();
  });

  it("deve atualizar dados do usuário corretamente", async () => {
    const createdUser = await userRepository.create({
      name: "Atualizar Teste",
      email: "atualiza@example.com",
      password_hash: "hash",
      role: ROLE.USER,
    });

    const updated = await userRepository.update(createdUser.id, {
      name: "Nome Atualizado",
    });

    expect(updated?.name).toBe("Nome Atualizado");
    expect(updated?.updatedAt).toBeInstanceOf(Date);
  });
  
  it("deve retornar todos os usuários com findMany", async () => {
    await userRepository.create({
      name: "Usuário 1",
      email: "user1@example.com",
      password_hash: "hash1",
      role: ROLE.EMPLOYEE,
    });

    await userRepository.create({
      name: "Usuário 2",
      email: "user2@example.com",
      password_hash: "hash2",
      role: ROLE.MANAGER,
    });

    const users = await userRepository.findMany();

    expect(users).toHaveLength(2);
    expect(users[0].name).toBe("Usuário 1");
    expect(users[1].name).toBe("Usuário 2");
  });

});
