import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllPurchaseService } from "./fetch-all-purchase";
import { PurchaseRepository } from "../../repositories/purchase-repository";

describe("FetchAllPurchaseService", () => {
  let mockPurchaseRepository: PurchaseRepository;
  let fetchAllPurchaseService: FetchAllPurchaseService;

  beforeEach(() => {
    mockPurchaseRepository = {
      findMany: vi.fn(),
    } as unknown as PurchaseRepository;

    fetchAllPurchaseService = new FetchAllPurchaseService(mockPurchaseRepository);
  });

  it("deve retornar todas as compras disponíveis", async () => {
    const mockPurchases = [
      {
        id: "purchase-1",
        nf_number: "12345",
        supplierId: "supplier-1",
        userId: "user-1",
        subTotal: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "purchase-2",
        nf_number: "67890",
        supplierId: "supplier-2",
        userId: "user-2",
        subTotal: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(mockPurchaseRepository, "findMany").mockResolvedValue(mockPurchases);

    const result = await fetchAllPurchaseService.execute();

    expect(mockPurchaseRepository.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      purchase: mockPurchases,
    });
  });

  it("deve retornar uma lista vazia se não houver compras disponíveis", async () => {
    vi.spyOn(mockPurchaseRepository, "findMany").mockResolvedValue([]);

    const result = await fetchAllPurchaseService.execute();

    expect(mockPurchaseRepository.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      purchase: [],
    });
  });
});
