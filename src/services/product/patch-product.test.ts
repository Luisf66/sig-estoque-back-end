import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatchProductService } from "./patch-product";
import { ProductRepository } from "../../repositories/product-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { InactiveError } from "../errors/inactive-error";

describe("PatchProductService", () => {
  let mockProductRepository: ProductRepository;
  let patchProductService: PatchProductService;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      patch: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      inactivate: vi.fn(),
    } as unknown as ProductRepository;

    patchProductService = new PatchProductService(mockProductRepository);
  });

  it("deve atualizar um produto ativo com sucesso", async () => {
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

    const updatedData = { name: "Produto A Atualizado", price: 120 };

    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(mockProduct);
    vi.spyOn(mockProductRepository, "patch").mockResolvedValue({
      ...mockProduct,
      ...updatedData,
    });

    const result = await patchProductService.handle({
      id: "product-1",
      data: updatedData,
    });

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.patch).toHaveBeenCalledWith("product-1", updatedData);
    expect(result.product).toEqual({ ...mockProduct, ...updatedData });
  });

  it("deve lançar um erro se o produto não for encontrado", async () => {
    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(null);

    await expect(
      patchProductService.handle({
        id: "product-1",
        data: { name: "Produto Inexistente" },
      })
    ).rejects.toThrowError(ResourceNotFoundError);

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.patch).not.toHaveBeenCalled();
  });

  it("deve lançar um erro se o produto estiver inativo", async () => {
    const mockProduct = {
      id: "product-1",
      name: "Produto Inativo",
      description: "Descrição do produto inativo",
      price: 100,
      quantity_in_stock: 50,
      batch: "Lote123",
      is_active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(mockProduct);

    await expect(
      patchProductService.handle({
        id: "product-1",
        data: { name: "Produto Atualizado" },
      })
    ).rejects.toThrowError(InactiveError);

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(mockProductRepository.patch).not.toHaveBeenCalled();
  });
});
