import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchAllProductService } from "./fetch-all-product";
import { ProductRepository } from "../../repositories/product-repository";
import { Product } from "@prisma/client";

describe("FetchAllProductService", () => {
  let mockProductRepository: ProductRepository;
  let fetchAllProductService: FetchAllProductService;

  beforeEach(() => {
    mockProductRepository = {
      findMany: vi.fn(),
    } as unknown as ProductRepository;

    fetchAllProductService = new FetchAllProductService(mockProductRepository);
  });

  it("deve buscar todos os produtos com sucesso", async () => {
    const mockProducts: Product[] = [
      {
        id: "product-1",
        name: "Produto A",
        description: "Descrição do produto A",
        price: 100,
        quantity_in_stock: 50,
        batch: "Lote123",
        is_active: true, // Adicionado para atender ao tipo `Product`
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "product-2",
        name: "Produto B",
        description: "Descrição do produto B",
        price: 200,
        quantity_in_stock: 30,
        batch: "Lote456",
        is_active: true, // Adicionado para atender ao tipo `Product`
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  
    // Mock do método findMany para simular o retorno de produtos
    vi.spyOn(mockProductRepository, "findMany").mockResolvedValue(mockProducts);
  
    const response = await fetchAllProductService.execute();
  
    expect(mockProductRepository.findMany).toHaveBeenCalled();
    expect(response.product).toEqual(mockProducts);
  });
});
