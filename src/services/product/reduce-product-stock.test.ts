import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReduceProductStockService } from "./reduce-product-stock";
import { ProductRepository } from "../../repositories/product-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("ReduceProductStockService", () => {
  let mockProductRepository: ProductRepository;
  let reduceProductStockService: ReduceProductStockService;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      reduceStock: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      inactivate: vi.fn(),
      patch: vi.fn(),
    } as unknown as ProductRepository;

    reduceProductStockService = new ReduceProductStockService(mockProductRepository);
  });

  it("deve reduzir o estoque de um produto com sucesso", async () => {
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
    vi.spyOn(mockProductRepository, "reduceStock").mockResolvedValue();

    await reduceProductStockService.execute({ productId: "product-1", quantity: 10 });

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-1", 10);
  });

  it("deve lançar um erro se o produto não for encontrado", async () => {
    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(null);

    await expect(
      reduceProductStockService.execute({ productId: "product-1", quantity: 10 })
    ).rejects.toThrowError(ResourceNotFoundError);

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
  });

  it("deve lançar um erro se o estoque do produto não estiver disponível", async () => {
    const mockProduct = {
      id: "product-1",
      name: "Produto A",
      description: "Descrição do produto A",
      price: 100,
      quantity_in_stock: null,
      batch: "Lote123",
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(mockProduct);

    await expect(
      reduceProductStockService.execute({ productId: "product-1", quantity: 10 })
    ).rejects.toThrowError("Product stock information is missing");

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
  });

  it("deve lançar um erro se o estoque for insuficiente", async () => {
    const mockProduct = {
      id: "product-1",
      name: "Produto A",
      description: "Descrição do produto A",
      price: 100,
      quantity_in_stock: 5,
      batch: "Lote123",
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(mockProduct);

    await expect(
      reduceProductStockService.execute({ productId: "product-1", quantity: 10 })
    ).rejects.toThrowError("Insufficient stock");

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
  });
});
