import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchAllPurchaseByUserIdService } from "../../services/purchase/fetch-all-purchase-by-user-id";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error";

// Mocks dos repositórios
const mockPurchaseRepository = {
  findManyByUserId: vi.fn(),
};

const mockUserRepository = {
  findById: vi.fn(),
};

describe("FetchAllPurchaseByUserIdService", () => {
  let fetchAllPurchaseByUserIdService: FetchAllPurchaseByUserIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchAllPurchaseByUserIdService = new FetchAllPurchaseByUserIdService(
      mockPurchaseRepository as any,
      mockUserRepository as any
    );
  });

  it("deve retornar todas as compras de um usuário válido", async () => {
    const userId = "user-1";

    const mockUser = { id: userId, name: "Usuário Teste" };
    const mockPurchases = [
      { id: "purchase-1", userId, total: 150, createdAt: new Date(), updatedAt: new Date() },
      { id: "purchase-2", userId, total: 300, createdAt: new Date(), updatedAt: new Date() },
    ];

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockPurchaseRepository.findManyByUserId.mockResolvedValue(mockPurchases);

    const result = await fetchAllPurchaseByUserIdService.execute({ userId });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith(userId);
    expect(result.purchases).toEqual(mockPurchases);
  });

  it("deve lançar ResourceNotFoundError se o usuário não for encontrado", async () => {
    const userId = "user-1";

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      fetchAllPurchaseByUserIdService.execute({ userId })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
  });
});
