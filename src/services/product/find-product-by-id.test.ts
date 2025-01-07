import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindProductByIdService } from "./find-product-by-id";
import { ProductRepository } from "../../repositories/product-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { InactiveError } from "../errors/inactive-error";
import { Product } from "@prisma/client";

describe("FindProductByIdService", () => {
  let mockProductRepository: ProductRepository;
  let findProductByIdService: FindProductByIdService;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as ProductRepository;

    findProductByIdService = new FindProductByIdService(mockProductRepository);
  });

  it("deve retornar o produto quando o ID for válido e o produto estiver ativo", async () => {
    const mockProduct: Product = {
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

    const response = await findProductByIdService.execute({ productId: "product-1" });

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
    expect(response.product).toEqual(mockProduct);
  });

  it("deve lançar um erro quando o produto não for encontrado", async () => {
    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(null);

    await expect(
      findProductByIdService.execute({ productId: "product-1" })
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
  });

  it("deve lançar um erro quando o produto estiver inativo", async () => {
    const mockProduct: Product = {
      id: "product-1",
      name: "Produto A",
      description: "Descrição do produto A",
      price: 100,
      quantity_in_stock: 50,
      batch: "Lote123",
      is_active: false, // Produto inativo
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockProductRepository, "findById").mockResolvedValue(mockProduct);

    await expect(
      findProductByIdService.execute({ productId: "product-1" })
    ).rejects.toThrow(InactiveError);

    expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
  });
});
