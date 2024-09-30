import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllSaleService } from "./fetch-all-sale";
import { InMemorySaleRepository } from "../../repositories/in-memory/in-memory-sale-repository";
import { Sale } from "@prisma/client";

describe("FetchAllSaleService", () => {
  let saleRepository: InMemorySaleRepository;
  let fetchAllSaleService: FetchAllSaleService;

  beforeEach(() => {
    saleRepository = new InMemorySaleRepository();
    fetchAllSaleService = new FetchAllSaleService(saleRepository);
  });

  it("deve buscar todas as vendas", async () => {
    // Criando vendas no repositório in-memory
    const sale1 = await saleRepository.create({
      nf_number: "12345",
      subTotal: 100.0,
      user: {
        connect: {
          id: "user-1",
        },
      },
    });

    const sale2 = await saleRepository.create({
      nf_number: "67890",
      subTotal: 150.0,
      user: {
        connect: {
          id: "user-2",
        },
      },
    });

    // Executando o serviço para buscar todas as vendas
    const { sale } = await fetchAllSaleService.execute();

    // Verificando se as vendas retornadas são as esperadas
    expect(sale).toEqual([sale1, sale2]);
  });

  it("deve retornar uma lista vazia se não houver vendas", async () => {
    // Executando o serviço sem criar vendas
    const { sale } = await fetchAllSaleService.execute();

    // Verificando se o resultado é uma lista vazia
    expect(sale).toEqual([]);
  });
});
