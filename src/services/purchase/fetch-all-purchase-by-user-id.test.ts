import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllPurchaseByUserIdService } from "./fetch-all-purchase-by-user-id";
import { PurchaseRepository } from "../../repositories/purchase-repository";
import { UserRepository } from "../../repositories/user-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("FetchAllPurchaseByUserIdService", () => {
  let mockPurchaseRepository: PurchaseRepository;
  let mockUserRepository: UserRepository;
  let fetchAllPurchaseByUserIdService: FetchAllPurchaseByUserIdService;

  beforeEach(() => {
    mockPurchaseRepository = {
      findManyByUserId: vi.fn(),
    } as unknown as PurchaseRepository;

    mockUserRepository = {
      findById: vi.fn(),
    } as unknown as UserRepository;

    fetchAllPurchaseByUserIdService = new FetchAllPurchaseByUserIdService(
      mockPurchaseRepository,
      mockUserRepository
    );
  });

  it("deve retornar todas as compras associadas a um usuário existente", async () => {
    const mockUser = {
      id: "user-1",
      name: "Usuário A",
      email: "usuarioa@email.com",
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
        supplierId: "supplier-2",
        userId: "user-1",
        subTotal: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);
    vi.spyOn(mockPurchaseRepository, "findManyByUserId").mockResolvedValue(mockPurchases);

    const result = await fetchAllPurchaseByUserIdService.execute({ userId: "user-1" });

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
    expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      purchases: mockPurchases,
    });
  });

  it("deve lançar um erro se o usuário não for encontrado", async () => {
    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(null);

    await expect(
      fetchAllPurchaseByUserIdService.execute({ userId: "user-1" })
    ).rejects.toThrowError(ResourceNotFoundError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
    expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
  });
});
