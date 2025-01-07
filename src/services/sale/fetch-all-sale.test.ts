import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllSaleService } from "./fetch-all-sale";
import { SaleRepository } from "../../repositories/sale-repository";

describe("FetchAllSaleService", () => {
  let mockSaleRepository: SaleRepository;
  let fetchAllSaleService: FetchAllSaleService;

  beforeEach(() => {
    mockSaleRepository = {
      findMany: vi.fn(),
    } as unknown as SaleRepository;

    fetchAllSaleService = new FetchAllSaleService(mockSaleRepository);
  });

  it("deve retornar todas as vendas", async () => {
    const mockSales = [
      { id: "sale-1", nf_number: "123", userId: "user-1", subTotal: 200 },
      { id: "sale-2", nf_number: "124", userId: "user-2", subTotal: 300 },
    ];

    vi.spyOn(mockSaleRepository, "findMany").mockResolvedValue(mockSales);

    const result = await fetchAllSaleService.execute();

    expect(mockSaleRepository.findMany).toHaveBeenCalled();
    expect(result).toEqual({ sale: mockSales });
  });

  it("deve retornar uma lista vazia se não houver vendas", async () => {
    vi.spyOn(mockSaleRepository, "findMany").mockResolvedValue([]);

    const result = await fetchAllSaleService.execute();

    expect(mockSaleRepository.findMany).toHaveBeenCalled();
    expect(result).toEqual({ sale: [] });
  });
});
