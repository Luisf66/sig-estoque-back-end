// tests/unit/services/product/fetch-all-product.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllProductService } from "../../../src/services/product/fetch-all-product";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import type { Product } from "@prisma/client";

describe("FetchAllProductService", () => {
  let fetchAllProductService: FetchAllProductService;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {
      findMany: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      // Adicione outros métodos se necessário
    };

    fetchAllProductService = new FetchAllProductService(mockProductRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return all products successfully", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Notebook Dell",
          description: "Notebook Dell Inspiron 15",
          price: 2500.99,
          quantity_in_stock: 50,
          batch: "BATCH-001",
          active: true,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "product-2",
          name: "Mouse Logitech",
          description: "Mouse sem fio Logitech",
          price: 89.90,
          quantity_in_stock: 100,
          batch: "BATCH-002",
          active: true,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(mockProductRepository.findMany).toHaveBeenCalledOnce();
      expect(result.product).toEqual(mockProducts);
      expect(result.product).toHaveLength(2);
    });

    it("should return empty array when no products exist", async () => {
      // Arrange
      const mockProducts: Product[] = [];
      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(mockProductRepository.findMany).toHaveBeenCalledOnce();
      expect(result.product).toEqual([]);
      expect(result.product).toHaveLength(0);
    });

    it("should propagate errors from product repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockProductRepository.findMany).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllProductService.execute())
        .rejects
        .toThrow("Database connection error");
      
      expect(mockProductRepository.findMany).toHaveBeenCalledOnce();
    });

    it("should return products with correct structure", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-123",
          name: "Teclado Mecânico",
          description: "Teclado mecânico RGB",
          price: 299.99,
          quantity_in_stock: 25,
          batch: "BATCH-123",
          active: true,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(result.product[0]).toHaveProperty('id');
      expect(result.product[0]).toHaveProperty('name');
      expect(result.product[0]).toHaveProperty('description');
      expect(result.product[0]).toHaveProperty('price');
      expect(result.product[0]).toHaveProperty('quantity_in_stock');
      expect(result.product[0]).toHaveProperty('batch');
      expect(result.product[0]).toHaveProperty('active');
      expect(result.product[0]).toHaveProperty('created_at');
      expect(result.product[0]).toHaveProperty('updated_at');
      
      expect(result.product[0].id).toBe("product-123");
      expect(result.product[0].name).toBe("Teclado Mecânico");
      expect(result.product[0].price).toBe(299.99);
      expect(result.product[0].active).toBe(true);
    });

    it("should handle mixed active and inactive products", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Produto Ativo",
          description: "Produto ativo em estoque",
          price: 100.00,
          quantity_in_stock: 10,
          batch: "BATCH-ACT",
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "product-2",
          name: "Produto Inativo",
          description: "Produto inativo",
          price: 50.00,
          quantity_in_stock: 0,
          batch: "BATCH-INACT",
          active: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(result.product).toHaveLength(2);
      expect(result.product[0].active).toBe(true);
      expect(result.product[1].active).toBe(false);
    });

    it("should handle products with zero quantity in stock", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Produto Sem Estoque",
          description: "Produto com estoque zerado",
          price: 150.00,
          quantity_in_stock: 0,
          batch: "BATCH-ZERO",
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(result.product[0].quantity_in_stock).toBe(0);
    });

    it("should handle products with decimal prices", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Produto Decimal",
          description: "Produto com preço decimal",
          price: 123.45,
          quantity_in_stock: 5,
          batch: "BATCH-DEC",
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(result.product[0].price).toBe(123.45);
    });

    it("should call repository method only once", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Produto Teste",
          description: "Descrição teste",
          price: 99.99,
          quantity_in_stock: 1,
          batch: "BATCH-TEST",
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      await fetchAllProductService.execute();

      // Assert
      expect(mockProductRepository.findMany).toHaveBeenCalledOnce();
      expect(mockProductRepository.findMany).not.toHaveBeenCalledTimes(2);
    });

    it("should return the same products array as repository", async () => {
      // Arrange
      const mockProducts: Product[] = [
        {
          id: "product-1",
          name: "Produto 1",
          description: "Descrição 1",
          price: 100.00,
          quantity_in_stock: 10,
          batch: "BATCH-1",
          active: true,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "product-2",
          name: "Produto 2",
          description: "Descrição 2",
          price: 200.00,
          quantity_in_stock: 20,
          batch: "BATCH-2",
          active: true,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(result.product).toBe(mockProducts); // Mesma referência
      expect(result.product).toEqual(mockProducts); // Mesmo conteúdo
    });

    it("should handle large number of products", async () => {
      // Arrange
      const mockProducts: Product[] = Array.from({ length: 100 }, (_, index) => ({
        id: `product-${index + 1}`,
        name: `Produto ${index + 1}`,
        description: `Descrição do produto ${index + 1}`,
        price: (index + 1) * 10,
        quantity_in_stock: index + 1,
        batch: `BATCH-${index + 1}`,
        active: index % 2 === 0, // Alterna entre ativo e inativo
        created_at: new Date(),
        updated_at: new Date(),
      }));

      vi.mocked(mockProductRepository.findMany).mockResolvedValue(mockProducts);

      // Act
      const result = await fetchAllProductService.execute();

      // Assert
      expect(result.product).toHaveLength(100);
      expect(result.product[0].id).toBe("product-1");
      expect(result.product[99].id).toBe("product-100");
    });
  });
});