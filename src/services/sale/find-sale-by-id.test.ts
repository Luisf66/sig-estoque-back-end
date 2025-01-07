import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindSaleByIdService } from "./find-sale-by-id";
import { SaleRepository } from "../../repositories/sale-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("FindSaleByIdService", () => {
  let mockSaleRepository: SaleRepository;
  let findSaleByIdService: FindSaleByIdService;

  beforeEach(() => {
    mockSaleRepository = {
      findById: vi.fn(),
    } as unknown as SaleRepository;

    findSaleByIdService = new FindSaleByIdService(mockSaleRepository);
  });

  it("deve retornar a venda correspondente ao ID fornecido", async () => {
    const mockSale = {
      id: "sale-1",
      nf_number: "123",
      userId: "user-1",
      subTotal: 500,
    };

    vi.spyOn(mockSaleRepository, "findById").mockResolvedValue(mockSale);

    const result = await findSaleByIdService.execute({ saleId: "sale-1" });

    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
    expect(result).toEqual({ sale: mockSale });
  });

  it("deve lançar um erro caso a venda não seja encontrada", async () => {
    vi.spyOn(mockSaleRepository, "findById").mockResolvedValue(null);

    await expect(findSaleByIdService.execute({ saleId: "sale-1" })).rejects.toBeInstanceOf(ResourceNotFoundError);

    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
  });
});
