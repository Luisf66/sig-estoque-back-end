import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreatePurchaseService } from "./create-purchase";
import { PurchaseRepository } from "../../repositories/purchase-repository";
import { ItemRepository } from "../../repositories/item-repository";
import { ProductRepository } from "../../repositories/product-repository";

describe("CreatePurchaseService", () => {
  let mockPurchaseRepository: PurchaseRepository;
  let mockItemRepository: ItemRepository;
  let mockProductRepository: ProductRepository;
  let createPurchaseService: CreatePurchaseService;

  beforeEach(() => {
    mockPurchaseRepository = {
      create: vi.fn(),
      updateSubTotal: vi.fn(),
    } as unknown as PurchaseRepository;

    mockItemRepository = {
      create: vi.fn(),
    } as unknown as ItemRepository;

    mockProductRepository = {
      findManyByIds: vi.fn(),
      increaseStock: vi.fn(),
    } as unknown as ProductRepository;

    createPurchaseService = new CreatePurchaseService(
      mockPurchaseRepository,
      mockItemRepository,
      mockProductRepository
    );
  });

  it("deve criar uma compra com sucesso", async () => {
    const mockPurchase = {
      id: "purchase-1",
      nf_number: "12345",
      supplierId: "supplier-1",
      userId: "user-1",
      subTotal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockItems = [
      {
        id: "item-1",
        quantity: 2,
        value: 50,
        purchaseId: "purchase-1",
        productId: "product-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockProducts = [
      {
        id: "product-1",
        name: "Produto A",
        description: "Descrição do produto A",
        price: 100,
        quantity_in_stock: 10,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(mockPurchaseRepository, "create").mockResolvedValue(mockPurchase);
    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue(mockProducts);
    vi.spyOn(mockItemRepository, "create").mockResolvedValue(mockItems[0]);
    vi.spyOn(mockPurchaseRepository, "updateSubTotal").mockResolvedValue({
      ...mockPurchase,
      subTotal: 100,
    });

    const result = await createPurchaseService.handle({
      nf_number: "12345",
      supplierId: "supplier-1",
      userId: "user-1",
      items: [
        {
          productId: "product-1",
          quantity: 2,
          value: 50,
        },
      ],
    });

    expect(mockPurchaseRepository.create).toHaveBeenCalledWith({
      nf_number: "12345",
      supplier: { connect: { id: "supplier-1" } },
      user: { connect: { id: "user-1" } },
    });

    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1"]);
    expect(mockProductRepository.increaseStock).toHaveBeenCalledWith("product-1", 2);
    expect(mockItemRepository.create).toHaveBeenCalledWith({
      purchase: { connect: { id: "purchase-1" } },
      quantity: 2,
      value: 50,
      product: { connect: { id: "product-1" } },
    });
    expect(mockPurchaseRepository.updateSubTotal).toHaveBeenCalledWith("purchase-1", 100);

    expect(result).toEqual({
      newPurchase: { ...mockPurchase, subTotal: 100 },
      items: mockItems,
    });
  });

  it("deve lançar um erro se algum produto não for encontrado", async () => {
    vi.spyOn(mockPurchaseRepository, "create").mockResolvedValue({
      id: "purchase-1",
    });
    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue([]);

    await expect(
      createPurchaseService.handle({
        nf_number: "12345",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          {
            productId: "product-1",
            quantity: 2,
            value: 50,
          },
        ],
      })
    ).rejects.toThrowError("Product not found");
  });

  it("deve lançar um erro se algum produto estiver inativo", async () => {
    const mockProducts = [
      {
        id: "product-1",
        name: "Produto A",
        description: "Descrição do produto A",
        price: 100,
        quantity_in_stock: 10,
        is_active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(mockPurchaseRepository, "create").mockResolvedValue({
      id: "purchase-1",
    });
    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue(mockProducts);

    await expect(
      createPurchaseService.handle({
        nf_number: "12345",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          {
            productId: "product-1",
            quantity: 2,
            value: 50,
          },
        ],
      })
    ).rejects.toThrowError("Product Produto A does not exist or is inactive");
  });
});
