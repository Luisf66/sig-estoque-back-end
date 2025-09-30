import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchAllPurchaseService } from "../../services/purchase/fetch-all-purchase";

// Mock do repositório
const mockPurchaseRepository = {
  findMany: vi.fn(),
};

describe("FetchAllPurchaseService", () => {
  let fetchAllPurchaseService: FetchAllPurchaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchAllPurchaseService = new FetchAllPurchaseService(
      mockPurchaseRepository as any
    );
  });

  it("deve retornar todas as compras", async () => {
    const mockPurchases = [
      { id: "purchase-1", total: 100, createdAt: new Date(), updatedAt: new Date() },
      { id: "purchase-2", total: 200, createdAt: new Date(), updatedAt: new Date() },
    ];

    mockPurchaseRepository.findMany.mockResolvedValue(mockPurchases);

    const result = await fetchAllPurchaseService.execute();

    expect(mockPurchaseRepository.findMany).toHaveBeenCalled();
    expect(result.purchase).toEqual(mockPurchases);
  });

  it("deve retornar um array vazio se não houver compras", async () => {
    mockPurchaseRepository.findMany.mockResolvedValue([]);

    const result = await fetchAllPurchaseService.execute();

    expect(mockPurchaseRepository.findMany).toHaveBeenCalled();
    expect(result.purchase).toEqual([]);
  });
});
