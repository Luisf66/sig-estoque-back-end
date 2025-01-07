import { describe, it, expect, vi, beforeEach } from "vitest";
import { InactivateProductService } from "./inactivate-product";
import { ProductRepository } from "../../repositories/product-repository";

describe("InactivateProductService", () => {
  let mockProductRepository: ProductRepository;
  let inactivateProductService: InactivateProductService;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      inactivate: vi.fn(),
    } as unknown as ProductRepository;

    inactivateProductService = new InactivateProductService(mockProductRepository);
  });

  it("deve inativar um produto com sucesso", async () => {
    const mockProduct = {
      id: "product-1",
      name: "Produto A",
      description: "Descrição do produto A",
      price: 100,
      quantity_in_stock: 50,
      batch: "Lote123",
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(mockProduct);
    vi.spyOn(mockProductRepository, "inactivate").mockResolvedValue();

    await inactivateProductService.execute({ productId: "product-1" });

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.inactivate).toHaveBeenCalledWith("product-1");
  });

  it("deve lançar um erro se o produto não for encontrado", async () => {
    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(null);

    await expect(
      inactivateProductService.execute({ productId: "product-1" })
    ).rejects.toThrowError("Product not found");

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.inactivate).not.toHaveBeenCalled();
  });
});
