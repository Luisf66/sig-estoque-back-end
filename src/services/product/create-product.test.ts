import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateProductService } from "./create-product";
import { ProductRepository } from "../../repositories/product-repository";
import { Product } from "@prisma/client";

describe("CreateProductService", () => {
  let mockProductRepository: ProductRepository;
  let createProductService: CreateProductService;

  beforeEach(() => {
    mockProductRepository = {
      create: vi.fn(),
    } as unknown as ProductRepository;

    createProductService = new CreateProductService(mockProductRepository);
  });

  it("deve criar um produto com sucesso", async () => {
    const mockProduct: Product = {
      id: "product-1",
      name: "Produto Teste",
      description: "Descrição do produto",
      price: 100,
      quantity_in_stock: 50,
      batch: "Lote123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock do repositório para simular o comportamento do banco
    vi.spyOn(mockProductRepository, "create").mockResolvedValue(mockProduct);

    const response = await createProductService.handle({
      name: "Produto Teste",
      description: "Descrição do produto",
      price: 100,
      quantity_in_stock: 50,
      batch: "Lote123",
    });

    expect(mockProductRepository.create).toHaveBeenCalledWith({
      name: "Produto Teste",
      description: "Descrição do produto",
      price: 100,
      quantity_in_stock: 50,
      batch: "Lote123",
    });

    expect(response.product).toEqual(mockProduct);
  });
});
