import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindPurchaseByIdService } from "./find-purchase-by-id";
import { PurchaseRepository } from "../../repositories/purchase-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("FindPurchaseByIdService", () => {
  let mockPurchaseRepository: PurchaseRepository;
  let findPurchaseByIdService: FindPurchaseByIdService;

  beforeEach(() => {
    mockPurchaseRepository = {
      findById: vi.fn(),
    } as unknown as PurchaseRepository;

    findPurchaseByIdService = new FindPurchaseByIdService(mockPurchaseRepository);
  });

  it("deve retornar a compra pelo ID", async () => {
    const mockPurchase = {
      id: "purchase-1",
      nf_number: "12345",
      supplierId: "supplier-1",
      userId: "user-1",
      subTotal: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockPurchaseRepository, "findById").mockResolvedValue(mockPurchase);

    const result = await findPurchaseByIdService.execute({ purchaseId: "purchase-1" });

    expect(mockPurchaseRepository.findById).toHaveBeenCalledWith("purchase-1");
    expect(result).toEqual({
      purchase: mockPurchase,
    });
  });

  it("deve lançar um erro se a compra não for encontrada", async () => {
    vi.spyOn(mockPurchaseRepository, "findById").mockResolvedValue(null);

    await expect(
      findPurchaseByIdService.execute({ purchaseId: "purchase-1" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);

    expect(mockPurchaseRepository.findById).toHaveBeenCalledWith("purchase-1");
  });
});
