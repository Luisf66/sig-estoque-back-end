import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateSaleService } from "./create-sale";
import { SaleRepository } from "../../repositories/sale-repository";
import { ItemRepository } from "../../repositories/item-repository";
import { ProductRepository } from "../../repositories/product-repository";

describe("CreateSaleService", () => {
  let mockSaleRepository: SaleRepository;
  let mockItemRepository: ItemRepository;
  let mockProductRepository: ProductRepository;
  let createSaleService: CreateSaleService;

  beforeEach(() => {
    mockSaleRepository = {
      create: vi.fn(),
      updateSubTotal: vi.fn(),
    } as unknown as SaleRepository;

    mockItemRepository = {
      create: vi.fn(),
    } as unknown as ItemRepository;

    mockProductRepository = {
      findManyByIds: vi.fn(),
      reduceStock: vi.fn(),
    } as unknown as ProductRepository;

    createSaleService = new CreateSaleService(
      mockSaleRepository,
      mockItemRepository,
      mockProductRepository
    );
  });

  it("deve criar uma nova venda com itens válidos", async () => {
    const mockSale = {
      id: "sale-1",
      sale_date: new Date(),
      nf_number: "12345",
      userId: "user-1",
      subTotal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockProducts = [
      { id: "product-1", name: "Product 1", is_active: true, quantity_in_stock: 10 },
      { id: "product-2", name: "Product 2", is_active: true, quantity_in_stock: 5 },
    ];

    const items = [
      { productId: "product-1", quantity: 2, value: 100 },
      { productId: "product-2", quantity: 3, value: 50 },
    ];

    const createdItems = [
      { id: "item-1", saleId: "sale-1", productId: "product-1", quantity: 2, value: 100 },
      { id: "item-2", saleId: "sale-1", productId: "product-2", quantity: 3, value: 50 },
    ];

    vi.spyOn(mockSaleRepository, "create").mockResolvedValue(mockSale);
    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue(mockProducts);
    vi.spyOn(mockItemRepository, "create")
      .mockResolvedValueOnce(createdItems[0])
      .mockResolvedValueOnce(createdItems[1]);
    vi.spyOn(mockSaleRepository, "updateSubTotal").mockResolvedValue({
      ...mockSale,
      subTotal: 350,
    });

    const result = await createSaleService.handle({
      nf_number: "12345",
      userId: "user-1",
      items,
    });

    expect(mockSaleRepository.create).toHaveBeenCalledWith({
      nf_number: "12345",
      user: { connect: { id: "user-1" } },
    });
    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1", "product-2"]);
    expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-1", 2);
    expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("product-2", 3);
    expect(mockItemRepository.create).toHaveBeenCalledTimes(2);
    expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith("sale-1", 350);
    expect(result).toEqual({
      newSale: { ...mockSale, subTotal: 350 },
      items: createdItems,
    });
  });

  it("deve lançar erro se algum produto não for encontrado", async () => {
    const items = [{ productId: "product-1", quantity: 2, value: 100 }];
    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue([]);

    await expect(
      createSaleService.handle({ nf_number: "12345", userId: "user-1", items })
    ).rejects.toThrowError("Product not found");

    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1"]);
  });

  it("deve lançar erro se algum produto estiver inativo", async () => {
    const mockProducts = [
      { id: "product-1", name: "Product 1", is_active: false, quantity_in_stock: 10 },
    ];
    const items = [{ productId: "product-1", quantity: 2, value: 100 }];

    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue(mockProducts);

    await expect(
      createSaleService.handle({ nf_number: "12345", userId: "user-1", items })
    ).rejects.toThrowError("Product Product 1 is inactive");

    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1"]);
  });

  it("deve lançar erro se o estoque for insuficiente", async () => {
    const mockProducts = [
      { id: "product-1", name: "Product 1", is_active: true, quantity_in_stock: 1 },
    ];
    const items = [{ productId: "product-1", quantity: 2, value: 100 }];

    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue(mockProducts);

    await expect(
      createSaleService.handle({ nf_number: "12345", userId: "user-1", items })
    ).rejects.toThrowError("Insufficient stock for product Product 1");

    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1"]);
  });

  it("deve lançar erro se a quantidade em estoque for indefinida", async () => {
    const mockProducts = [
      { id: "product-1", name: "Product 1", is_active: true, quantity_in_stock: null },
    ];
    const items = [{ productId: "product-1", quantity: 2, value: 100 }];

    vi.spyOn(mockProductRepository, "findManyByIds").mockResolvedValue(mockProducts);

    await expect(
      createSaleService.handle({ nf_number: "12345", userId: "user-1", items })
    ).rejects.toThrowError("Stock quantity for product Product 1 is undefined");

    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith(["product-1"]);
  });
});
