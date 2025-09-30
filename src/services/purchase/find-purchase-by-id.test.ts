import { describe, it, expect, beforeEach, vi } from "vitest";
import { FindPurchaseByIdService } from "../../services/purchase/find-purchase-by-id";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error";

// Mock do repositório
const mockPurchaseRepository = {
  findById: vi.fn(),
};

describe("FindPurchaseByIdService", () => {
  let findPurchaseByIdService: FindPurchaseByIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    findPurchaseByIdService = new FindPurchaseByIdService(
      mockPurchaseRepository as any
    );
  });

  it("deve retornar a compra quando ela existir", async () => {
    const purchaseId = "purchase-1";
    const mockPurchase = {
      id: purchaseId,
      nf_number: "12345",
      subTotal: 300,
      userId: "user-1",
      supplierId: "supplier-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPurchaseRepository.findById.mockResolvedValue(mockPurchase);

    const result = await findPurchaseByIdService.execute({ purchaseId });

    expect(mockPurchaseRepository.findById).toHaveBeenCalledWith(purchaseId);
    expect(result.purchase).toEqual(mockPurchase);
  });

  it("deve lançar ResourceNotFoundError se a compra não for encontrada", async () => {
    const purchaseId = "purchase-inexistente";

    mockPurchaseRepository.findById.mockResolvedValue(null);

    await expect(
      findPurchaseByIdService.execute({ purchaseId })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);

    expect(mockPurchaseRepository.findById).toHaveBeenCalledWith(purchaseId);
  });
});
