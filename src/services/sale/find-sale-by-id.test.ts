import { describe, it, expect, beforeEach } from "vitest";
import { FindSaleByIdService } from "./find-sale-by-id";
import { Sale } from "@prisma/client";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

// Repositório em memória simulado
class InMemorySaleRepository {
  public items: Sale[] = [];

  async findById(id: string): Promise<Sale | null> {
    const sale = this.items.find((item) => item.id === id);
    return sale || null;
  }
}

describe("FindSaleByIdService", () => {
  let saleRepository: InMemorySaleRepository;
  let sut: FindSaleByIdService;

  beforeEach(() => {
    saleRepository = new InMemorySaleRepository();
    sut = new FindSaleByIdService(saleRepository as any);
  });

  it("deve retornar a venda correspondente ao ID fornecido", async () => {
    const saleData: Sale = {
      id: "sale-01",
      sale_date: new Date(),
      nf_number: "NF123",
      subTotal: 500,
      userId: "user-01",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saleRepository.items.push(saleData);

    const { sale } = await sut.execute({ saleId: "sale-01" });

    expect(sale).toEqual(saleData);
  });

  it("deve lançar ResourceNotFoundError se a venda não for encontrada", async () => {
    await expect(() =>
      sut.execute({ saleId: "non-existent-sale" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
