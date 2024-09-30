import { describe, it, expect, beforeEach } from "vitest";
import { FindSaleByIdService } from "./find-sale-by-id";
import { InMemorySaleRepository } from "../../repositories/in-memory/in-memory-sale-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("FindSaleByIdService", () => {
  let saleRepository: InMemorySaleRepository;
  let findSaleByIdService: FindSaleByIdService;

  beforeEach(() => {
    saleRepository = new InMemorySaleRepository();
    findSaleByIdService = new FindSaleByIdService(saleRepository);
  });

  it("deve encontrar uma venda pelo ID", async () => {
    // Criando uma venda no repositório in-memory
    const sale = await saleRepository.create({
      nf_number: "12345",
      subTotal: 100.0,
      user: {
        connect: {
          id: "user-1",
        },
      },
    });

    // Executando o serviço para buscar a venda pelo ID
    const response = await findSaleByIdService.execute({ saleId: sale.id });

    // Verificando se a venda retornada é a esperada
    expect(response.sale).toEqual(sale);
  });

  it("deve lançar um erro se a venda não for encontrada", async () => {
    // Executando o serviço com um ID que não existe
    await expect(findSaleByIdService.execute({ saleId: "non-existent-id" }))
      .rejects
      .toBeInstanceOf(ResourceNotFoundError);
  });
});
