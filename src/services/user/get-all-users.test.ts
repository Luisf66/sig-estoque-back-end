import { describe, it, expect, beforeEach } from "vitest";
import { GetAllUsersService } from "./get-all-users";
import { UserRepository } from "../../repositories/user-repository";
import { User, ROLE } from "@prisma/client"; // ROLE é obrigatório

class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(data: any) {
    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role ?? ROLE.EMPLOYEE, // ✅ Adiciona role padrão
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
      role: ROLE.EMPLOYEE,
    });

    const user2 = await userRepository.create({
      name: "Usuário 2",
      email: "user2@example.com",
      password_hash: "hash2",
      role: ROLE.MANAGER,
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

  it("deve encontrar um usuário pelo email", async () => {
    const created = await userRepository.create({
      name: "Teste",
      email: "teste@email.com",
      password_hash: "hash",
      role: ROLE.EMPLOYEE,
    });

    const found = await userRepository.findByEmail("teste@email.com");
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
  });

  it("deve retornar null ao procurar por email inexistente", async () => {
    const found = await userRepository.findByEmail("naoexiste@email.com");
    expect(found).toBeNull();
  });

  it("deve encontrar um usuário pelo ID", async () => {
    const created = await userRepository.create({
      name: "Por ID",
      email: "id@email.com",
      password_hash: "hash",
      role: ROLE.EMPLOYEE,
    });

    const found = await userRepository.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.email).toBe(created.email);
  });

  it("deve retornar null ao procurar por ID inexistente", async () => {
    const found = await userRepository.findById("id-invalido");
    expect(found).toBeNull();
  });

  it("deve deletar um usuário existente", async () => {
    const created = await userRepository.create({
      name: "Para deletar",
      email: "delete@email.com",
      password_hash: "hash",
      role: ROLE.EMPLOYEE,
    });

    const deleted = await userRepository.delete(created.id);
    expect(deleted).not.toBeNull();
    expect(deleted.id).toBe(created.id);

    const stillExists = await userRepository.findById(created.id);
    expect(stillExists).toBeNull();
  });

  it("deve retornar null ao tentar deletar usuário inexistente", async () => {
    const deleted = await userRepository.delete("id-invalido");
    expect(deleted).toBeNull();
  });

  it("deve atualizar um usuário existente", async () => {
    const created = await userRepository.create({
      name: "Atualizar",
      email: "update@email.com",
      password_hash: "hash",
      role: ROLE.EMPLOYEE,
    });

    const updated = await userRepository.update(created.id, {
      name: "Nome Atualizado",
      role: ROLE.MANAGER,
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Nome Atualizado");
    expect(updated?.role).toBe(ROLE.MANAGER);
  });

  it("deve retornar null ao tentar atualizar usuário inexistente", async () => {
    const updated = await userRepository.update("id-invalido", {
      name: "Novo Nome",
    });
    expect(updated).toBeNull();
  });
});
