// tests/unit/services/sale/create-sale.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSaleService } from "../../../src/services/sale/create-sale";
import type { SaleRepository } from "../../../src/repositories/sale-repository";
import type { ItemRepository } from "../../../src/repositories/item-repository";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import type { Sale, Item, Product } from "@prisma/client";

// Interface extendida para incluir is_active
interface ProductWithIsActive extends Product {
  is_active: boolean;
}

describe("CreateSaleService", () => {
  let createSaleService: CreateSaleService;
  let mockSaleRepository: SaleRepository;
  let mockItemRepository: ItemRepository;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockSaleRepository = {
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      findManyByUserId: vi.fn(),
      // Adicione outros métodos se necessário
    };

    mockItemRepository = {
      create: vi.fn(),
      findMany: vi.fn(),
      findManyBySaleId: vi.fn(),
      // Adicione outros métodos se necessário
    };

    mockProductRepository = {
      findManyByIds: vi.fn(),
      reduceStock: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      inactivate: vi.fn(),
      patch: vi.fn(),
      increaseStock: vi.fn(),
      // Adicione outros métodos se necessário
    };

    createSaleService = new CreateSaleService(
      mockSaleRepository,
      mockItemRepository,
      mockProductRepository
    );

    vi.clearAllMocks();
  });

  describe("handle", () => {
    const mockRequest = {
      nf_number: "NF-123456",
      userId: "user-123",
      items: [
        {
          productId: "product-1",
          quantity: 5,
          value: 25.50,
        },
        {
          productId: "product-2",
          quantity: 3,
          value: 15.75,
        },
      ],
    };

    const mockSale: Sale = {
      id: "sale-123",
      nf_number: "NF-123456",
      user_id: "user-123",
      sub_total: 0,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    const mockUpdatedSale: Sale = {
      ...mockSale,
      sub_total: 174.75, // (5 * 25.50) + (3 * 15.75) = 127.50 + 47.25 = 174.75
      updated_at: new Date('2023-01-02'),
    };

    const mockActiveProducts: ProductWithIsActive[] = [
      {
        id: "product-1",
        name: "Product 1",
        description: "Description 1",
        price: 30.00,
        quantity_in_stock: 50,
        batch: "BATCH-1",
        active: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "product-2",
        name: "Product 2",
        description: "Description 2",
        price: 20.00,
        quantity_in_stock: 25,
        batch: "BATCH-2",
        active: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const mockInactiveProduct: ProductWithIsActive = {
      ...mockActiveProducts[0],
      active: false,
      is_active: false,
    };

    const mockProductWithNullStock: ProductWithIsActive = {
      ...mockActiveProducts[0],
      quantity_in_stock: null,
    };

    const mockProductWithLowStock: ProductWithIsActive = {
      ...mockActiveProducts[0],
      quantity_in_stock: 2,
    };

    const mockItems: Item[] = [
      {
        id: "item-1",
        sale_id: "sale-123",
        product_id: "product-1",
        quantity: 5,
        value: 25.50,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "item-2",
        sale_id: "sale-123",
        product_id: "product-2",
        quantity: 3,
        value: 15.75,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it("should create sale successfully with multiple items", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(mockActiveProducts as Product[]);
      vi.mocked(mockItemRepository.create)
        .mockResolvedValueOnce(mockItems[0])
        .mockResolvedValueOnce(mockItems[1]);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue(mockUpdatedSale);

      // Act
      const result = await createSaleService.handle(mockRequest);

      // Assert
      expect(mockSaleRepository.create).toHaveBeenCalledWith({
        nf_number: mockRequest.nf_number,
        user: { connect: { id: mockRequest.userId } },
      });

      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1", "product-2"]);

      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-1", 5);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-2", 3);

      expect(mockItemRepository.create).toHaveBeenCalledTimes(2);
      expect(mockItemRepository.create).toHaveBeenNthCalledWith(1, {
        sale: { connect: { id: mockSale.id } },
        quantity: 5,
        value: 25.50,
        product: { connect: { id: "product-1" } },
      });
      expect(mockItemRepository.create).toHaveBeenNthCalledWith(2, {
        sale: { connect: { id: mockSale.id } },
        quantity: 3,
        value: 15.75,
        product: { connect: { id: "product-2" } },
      });

      expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-123", 174.75);

      expect(result.newSale).toEqual(mockUpdatedSale);
      expect(result.items).toEqual(mockItems);
    });

    it("should throw error when product not found", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue([mockActiveProducts[0]] as Product[]); // Only one product found

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow("Product not found");

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1", "product-2"]);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
      expect(mockItemRepository.create).not.toHaveBeenCalled();
      expect(mockSaleRepository.updateSubTotal).not.toHaveBeenCalled();
    });

    it("should throw error when product is inactive", async () => {
      // Arrange
      const productsWithInactive = [mockInactiveProduct, mockActiveProducts[1]] as Product[];
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(productsWithInactive);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow(`Product ${mockInactiveProduct.name} is inactive`);

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1", "product-2"]);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when product stock is null", async () => {
      // Arrange
      const productsWithNullStock = [mockProductWithNullStock, mockActiveProducts[1]] as Product[];
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(productsWithNullStock);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow(`Stock quantity for product ${mockProductWithNullStock.name} is undefined`);

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1", "product-2"]);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when insufficient stock", async () => {
      // Arrange
      const productsWithLowStock = [mockProductWithLowStock, mockActiveProducts[1]] as Product[];
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(productsWithLowStock);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow(`Insufficient stock for product ${mockProductWithLowStock.name}`);

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1", "product-2"]);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate errors from sale repository during creation", async () => {
      // Arrange
      const repositoryError = new Error("Sale creation failed");
      vi.mocked(mockSaleRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow("Sale creation failed");

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).not.toHaveBeenCalled();
    });

    it("should propagate errors from product repository during find", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      const repositoryError = new Error("Product search failed");
      vi.mocked(mockProductRepository.findManyByIds).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow("Product search failed");

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalled();
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should propagate errors from item repository during creation", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(mockActiveProducts as Product[]);
      const repositoryError = new Error("Item creation failed");
      vi.mocked(mockItemRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow("Item creation failed");

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalled();
      expect(mockItemRepository.create).toHaveBeenCalled();
    });

    it("should propagate errors from product repository during stock reduction", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(mockActiveProducts as Product[]);
      const repositoryError = new Error("Stock reduction failed");
      vi.mocked(mockProductRepository.reduceStock).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createSaleService.handle(mockRequest))
        .rejects
        .toThrow("Stock reduction failed");

      expect(mockSaleRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.findManyByIds).toHaveBeenCalled();
      expect(mockProductRepository.reduceStock).toHaveBeenCalled();
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it("should handle sale with single item", async () => {
      // Arrange
      const singleItemRequest = {
        ...mockRequest,
        items: [
          {
            productId: "product-1",
            quantity: 5,
            value: 25.50,
          },
        ],
      };

      const singleItemProducts = [mockActiveProducts[0]] as Product[];
      const singleItem = [mockItems[0]];
      const updatedSaleWithSingleItem: Sale = {
        ...mockSale,
        sub_total: 127.50, // 5 * 25.50
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(singleItemProducts);
      vi.mocked(mockItemRepository.create).mockResolvedValue(mockItems[0]);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue(updatedSaleWithSingleItem);

      // Act
      const result = await createSaleService.handle(singleItemRequest);

      // Assert
      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1"]);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-1", 5);
      expect(mockItemRepository.create).toHaveBeenCalledTimes(1);
      expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-123", 127.50);
      expect(result.newSale.sub_total).toBe(127.50);
      expect(result.items).toEqual(singleItem);
    });

    it("should handle sale with exact stock quantity", async () => {
      // Arrange
      const exactStockRequest = {
        ...mockRequest,
        items: [
          {
            productId: "product-1",
            quantity: 50, // Exact same as current stock
            value: 25.50,
          },
        ],
      };

      const singleProduct = [mockActiveProducts[0]] as Product[];
      const exactStockItem: Item = {
        ...mockItems[0],
        quantity: 50,
      };
      const updatedSale: Sale = {
        ...mockSale,
        sub_total: 1275.00, // 50 * 25.50
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(singleProduct);
      vi.mocked(mockItemRepository.create).mockResolvedValue(exactStockItem);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue(updatedSale);

      // Act
      const result = await createSaleService.handle(exactStockRequest);

      // Assert
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-1", 50);
      expect(result.newSale.sub_total).toBe(1275.00);
    });

    it("should handle sale with zero quantity items", async () => {
      // Arrange
      const zeroQuantityRequest = {
        ...mockRequest,
        items: [
          {
            productId: "product-1",
            quantity: 0,
            value: 25.50,
          },
        ],
      };

      const singleProduct = [mockActiveProducts[0]] as Product[];
      const zeroQuantityItem: Item = {
        ...mockItems[0],
        quantity: 0,
      };
      const updatedSaleWithZeroTotal: Sale = {
        ...mockSale,
        sub_total: 0,
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(singleProduct);
      vi.mocked(mockItemRepository.create).mockResolvedValue(zeroQuantityItem);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue(updatedSaleWithZeroTotal);

      // Act
      const result = await createSaleService.handle(zeroQuantityRequest);

      // Assert
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-1", 0);
      expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-123", 0);
      expect(result.newSale.sub_total).toBe(0);
    });

    it("should handle sale with zero value items", async () => {
      // Arrange
      const zeroValueRequest = {
        ...mockRequest,
        items: [
          {
            productId: "product-1",
            quantity: 5,
            value: 0,
          },
        ],
      };

      const singleProduct = [mockActiveProducts[0]] as Product[];
      const zeroValueItem: Item = {
        ...mockItems[0],
        value: 0,
      };
      const updatedSaleWithZeroTotal: Sale = {
        ...mockSale,
        sub_total: 0,
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(singleProduct);
      vi.mocked(mockItemRepository.create).mockResolvedValue(zeroValueItem);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue(updatedSaleWithZeroTotal);

      // Act
      const result = await createSaleService.handle(zeroValueRequest);

      // Assert
      expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-123", 0);
      expect(result.newSale.sub_total).toBe(0);
    });

    it("should calculate correct subtotal for multiple items", async () => {
      // Arrange
      const complexItemsRequest = {
        ...mockRequest,
        items: [
          { productId: "product-1", quantity: 3, value: 10.00 },
          { productId: "product-2", quantity: 2, value: 5.50 },
          { productId: "product-3", quantity: 1, value: 7.25 },
        ],
      };

      const complexProducts = [
        ...mockActiveProducts,
        { ...mockActiveProducts[0], id: "product-3" }
      ] as Product[];

      const complexItems: Item[] = [
        { ...mockItems[0], quantity: 3, value: 10.00 },
        { ...mockItems[1], quantity: 2, value: 5.50 },
        { ...mockItems[0], id: "item-3", product_id: "product-3", quantity: 1, value: 7.25 },
      ];

      const expectedSubTotal = (3 * 10.00) + (2 * 5.50) + (1 * 7.25); // 30 + 11 + 7.25 = 48.25

      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue(complexProducts);
      vi.mocked(mockItemRepository.create)
        .mockResolvedValueOnce(complexItems[0])
        .mockResolvedValueOnce(complexItems[1])
        .mockResolvedValueOnce(complexItems[2]);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue({
        ...mockSale,
        sub_total: expectedSubTotal,
      });

      // Act
      const result = await createSaleService.handle(complexItemsRequest);

      // Assert
      expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-123", expectedSubTotal);
      expect(result.newSale.sub_total).toBe(expectedSubTotal);
    });

    it("should handle empty items array", async () => {
      // Arrange
      const emptyItemsRequest = {
        ...mockRequest,
        items: [],
      };

      vi.mocked(mockSaleRepository.create).mockResolvedValue(mockSale);
      vi.mocked(mockProductRepository.findManyByIds).mockResolvedValue([]);
      vi.mocked(mockSaleRepository.updateSubTotal).mockResolvedValue({
        ...mockSale,
        sub_total: 0,
      });

      // Act
      const result = await createSaleService.handle(emptyItemsRequest);

      // Assert
      expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith([]);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
      expect(mockItemRepository.create).not.toHaveBeenCalled();
      expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-123", 0);
      expect(result.items).toEqual([]);
      expect(result.newSale.sub_total).toBe(0);
    });
  });
});