import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchAllPurchaseBySupplierIdService } from "../../services/purchase/fetch-all-purchase-by-supplier-id";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error";

// Mocks dos repositórios
const mockPurchaseRepository = {
  findManyBySupplierId: vi.fn(),
};

const mockSupplierRepository = {
  findById: vi.fn(),
};

describe("FetchAllPurchaseBySupplierIdService", () => {
  let fetchAllPurchaseBySupplierIdService: FetchAllPurchaseBySupplierIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchAllPurchaseBySupplierIdService = new FetchAllPurchaseBySupplierIdService(
      mockPurchaseRepository as any,
      mockSupplierRepository as any
    );
  });

  it("deve retornar todas as compras de um fornecedor válido", async () => {
    const supplierId = "supplier-1";

    const mockSupplier = { id: supplierId, name: "Fornecedor Teste" };
    const mockPurchases = [
      { id: "purchase-1", supplierId, total: 100, createdAt: new Date(), updatedAt: new Date() },
      { id: "purchase-2", supplierId, total: 200, createdAt: new Date(), updatedAt: new Date() },
    ];

    mockSupplierRepository.findById.mockResolvedValue(mockSupplier);
    mockPurchaseRepository.findManyBySupplierId.mockResolvedValue(mockPurchases);

    const result = await fetchAllPurchaseBySupplierIdService.execute({ supplierId });

    expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
    expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith(supplierId);
    expect(result.purchases).toEqual(mockPurchases);
  });

  it("deve lançar ResourceNotFoundError se o fornecedor não for encontrado", async () => {
    const supplierId = "supplier-1";

    mockSupplierRepository.findById.mockResolvedValue(null);

    await expect(
      fetchAllPurchaseBySupplierIdService.execute({ supplierId })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);

    expect(mockSupplierRepository.findById).toHaveBeenCalledWith(supplierId);
    expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
  });
});
