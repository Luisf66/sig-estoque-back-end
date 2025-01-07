import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllSaleByUserIdService } from "./fetch-all-sale-by-user-id";
import { SaleRepository } from "../../repositories/sale-repository";
import { UserRepository } from "../../repositories/user-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("FetchAllSaleByUserIdService", () => {
  let mockSaleRepository: SaleRepository;
  let mockUserRepository: UserRepository;
  let fetchAllSaleByUserIdService: FetchAllSaleByUserIdService;

  beforeEach(() => {
    mockSaleRepository = {
      findManyByUserId: vi.fn(),
    } as unknown as SaleRepository;

    mockUserRepository = {
      findById: vi.fn(),
    } as unknown as UserRepository;

    fetchAllSaleByUserIdService = new FetchAllSaleByUserIdService(
      mockSaleRepository,
      mockUserRepository
    );
  });

  it("deve retornar todas as vendas de um usuário válido", async () => {
    const userId = "user-1";
    const mockUser = { id: userId, name: "John Doe", email: "john@example.com" };
    const mockSales = [
      { id: "sale-1", nf_number: "123", userId: "user-1", subTotal: 200 },
      { id: "sale-2", nf_number: "124", userId: "user-1", subTotal: 300 },
    ];

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);
    vi.spyOn(mockSaleRepository, "findManyByUserId").mockResolvedValue(mockSales);

    const result = await fetchAllSaleByUserIdService.execute({ userId });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ sales: mockSales });
  });

  it("deve lançar erro se o usuário não for encontrado", async () => {
    const userId = "user-1";

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(null);

    await expect(
      fetchAllSaleByUserIdService.execute({ userId })
    ).rejects.toThrowError(ResourceNotFoundError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalled();
  });

  it("deve retornar uma lista vazia se o usuário não tiver vendas", async () => {
    const userId = "user-1";
    const mockUser = { id: userId, name: "John Doe", email: "john@example.com" };

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);
    vi.spyOn(mockSaleRepository, "findManyByUserId").mockResolvedValue([]);

    const result = await fetchAllSaleByUserIdService.execute({ userId });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ sales: [] });
  });
});
