import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllSaleService } from "./fetch-all-sale";
import { Sale } from "@prisma/client";

// Repositório em memória simulado
class InMemorySaleRepository {
  public items: Sale[] = [];

  async findMany(): Promise<Sale[]> {
    return this.items;
  }
}

describe("FetchAllSaleService", () => {
  let saleRepository: InMemorySaleRepository;
  let sut: FetchAllSaleService;

  beforeEach(() => {
    saleRepository = new InMemorySaleRepository();
    sut = new FetchAllSaleService(saleRepository as any);
  });

  it("deve buscar todas as vendas existentes", async () => {
    saleRepository.items.push(
      {
        id: "sale-01",
        sale_date: new Date(),
        nf_number: "NF001",
        subTotal: 100.0,
        userId: "user-01",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sale-02",
        sale_date: new Date(),
        nf_number: "NF002",
        subTotal: 250.0,
        userId: "user-02",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    const { sale } = await sut.execute();

    expect(sale).toHaveLength(2);
    expect(sale[0].id).toBe("sale-01");
    expect(sale[1].id).toBe("sale-02");
  });

  it("deve retornar um array vazio quando não houver vendas", async () => {
    const { sale } = await sut.execute();

    expect(sale).toEqual([]);
    expect(sale).toHaveLength(0);
  });
});
