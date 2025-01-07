import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllPurchaseBySupplierIdService } from "./fetch-all-purchase-by-supplier-id";
import { PurchaseRepository } from "../../repositories/purchase-repository";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("FetchAllPurchaseBySupplierIdService", () => {
  let mockPurchaseRepository: PurchaseRepository;
  let mockSupplierRepository: SupplierRepository;
  let fetchAllPurchaseBySupplierIdService: FetchAllPurchaseBySupplierIdService;

  beforeEach(() => {
    mockPurchaseRepository = {
      findManyBySupplierId: vi.fn(),
    } as unknown as PurchaseRepository;

    mockSupplierRepository = {
      findById: vi.fn(),
    } as unknown as SupplierRepository;

    fetchAllPurchaseBySupplierIdService = new FetchAllPurchaseBySupplierIdService(
      mockPurchaseRepository,
      mockSupplierRepository
    );
  });

  it("deve retornar todas as compras associadas a um fornecedor existente", async () => {
    const mockSupplier = {
      id: "supplier-1",
      name: "Fornecedor A",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
        supplierId: "supplier-1",
        userId: "user-2",
        subTotal: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(mockSupplierRepository, "findById").mockResolvedValue(mockSupplier);
    vi.spyOn(mockPurchaseRepository, "findManyBySupplierId").mockResolvedValue(mockPurchases);

    const result = await fetchAllPurchaseBySupplierIdService.execute({ supplierId: "supplier-1" });

    expect(mockSupplierRepository.findById).toHaveBeenCalledWith("supplier-1");
    expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith("supplier-1");
    expect(result).toEqual({
      purchases: mockPurchases,
    });
  });

  it("deve lançar um erro se o fornecedor não for encontrado", async () => {
    vi.spyOn(mockSupplierRepository, "findById").mockResolvedValue(null);

    await expect(
      fetchAllPurchaseBySupplierIdService.execute({ supplierId: "supplier-1" })
    ).rejects.toThrowError(ResourceNotFoundError);

    expect(mockSupplierRepository.findById).toHaveBeenCalledWith("supplier-1");
    expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
  });
});
