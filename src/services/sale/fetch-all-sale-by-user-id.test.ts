import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllSaleByUserIdService } from "./fetch-all-sale-by-user-id";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { Sale } from "@prisma/client";

// Repositórios em memória simulados
class InMemorySaleRepository {
  public items: Sale[] = [];

  async findManyByUserId(userId: string): Promise<Sale[]> {
    return this.items.filter((sale) => sale.userId === userId);
  }
}

class InMemoryUserRepository {
  private users: { id: string; name: string }[] = [];

  async findById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  async create(id: string, name: string) {
    this.users.push({ id, name });
  }
}

describe("FetchAllSaleByUserIdService", () => {
  let saleRepository: InMemorySaleRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FetchAllSaleByUserIdService;

  beforeEach(() => {
    saleRepository = new InMemorySaleRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FetchAllSaleByUserIdService(saleRepository as any, userRepository as any);
  });

  it("deve buscar todas as vendas de um usuário existente", async () => {
    await userRepository.create("user-01", "Usuário Teste");

    saleRepository.items.push(
      {
        id: "sale-01",
        sale_date: new Date(),
        nf_number: "NF001",
        subTotal: 150.5,
        userId: "user-01",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sale-02",
        sale_date: new Date(),
        nf_number: "NF002",
        subTotal: 200.0,
        userId: "user-01",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sale-03",
        sale_date: new Date(),
        nf_number: "NF003",
        subTotal: 300.0,
        userId: "user-02",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    const { sales } = await sut.execute({ userId: "user-01" });

    expect(sales).toHaveLength(2);
    expect(sales[0].id).toBe("sale-01");
    expect(sales[1].id).toBe("sale-02");
  });

  it("deve lançar erro se o usuário não for encontrado", async () => {
    await expect(() => sut.execute({ userId: "non-existent-user" })).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve retornar um array vazio se o usuário não tiver vendas", async () => {
    await userRepository.create("user-02", "Usuário Sem Vendas");

    const { sales } = await sut.execute({ userId: "user-02" });

    expect(sales).toHaveLength(0);
  });
});
