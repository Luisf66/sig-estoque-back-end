import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateSaleService } from "../../services/sale/create-sale";

describe("CreateSaleService", () => {
  let mockSaleRepository: any;
  let mockItemRepository: any;
  let mockProductRepository: any;
  let createSaleService: CreateSaleService;

  beforeEach(() => {
    mockSaleRepository = {
      create: vi.fn(),
      updateSubTotal: vi.fn(),
    };

    mockItemRepository = {
      create: vi.fn(),
    };

    mockProductRepository = {
      findManyByIds: vi.fn(),
      reduceStock: vi.fn(),
    };

    createSaleService = new CreateSaleService(
      mockSaleRepository,
      mockItemRepository,
      mockProductRepository
    );

    vi.clearAllMocks();
  });

  it("deve criar uma venda com itens e atualizar o subtotal corretamente", async () => {
    const userId = "user-1";
    const nf_number = "NF123";
    const saleId = "sale-1";

    const items = [
      { productId: "product-1", quantity: 2, value: 50 },
      { productId: "product-2", quantity: 1, value: 100 },
    ];

    const mockSale = { id: saleId, nf_number, userId, subTotal: 0 };
    const mockProducts = [
      { id: "product-1", name: "Produto 1", is_active: true, quantity_in_stock: 10 },
      { id: "product-2", name: "Produto 2", is_active: true, quantity_in_stock: 5 },
    ];

    const createdItems = [
      { id: "item-1", saleId, ...items[0] },
      { id: "item-2", saleId, ...items[1] },
    ];

    mockSaleRepository.create.mockResolvedValue(mockSale);
    mockProductRepository.findManyByIds.mockResolvedValue(mockProducts);
    mockItemRepository.create
      .mockResolvedValueOnce(createdItems[0])
      .mockResolvedValueOnce(createdItems[1]);
    mockSaleRepository.updateSubTotal.mockResolvedValue({
      ...mockSale,
      subTotal: 200,
    });

    const result = await createSaleService.handle({
      nf_number,
      userId,
      items,
    });

    expect(mockSaleRepository.create).toHaveBeenCalledWith({
      nf_number,
      user: { connect: { id: userId } },
    });

    expect(mockProductRepository.findManyByIds).toHaveBeenCalledWith([
      "product-1",
      "product-2",
    ]);

    expect(mockProductRepository.reduceStock).toHaveBeenCalledTimes(2);
    expect(mockItemRepository.create).toHaveBeenCalledTimes(2);
    expect(mockSaleRepository.updateSubTotal).toHaveBeenCalledWith(saleId, 200);

    expect(result.newSale.subTotal).toBe(200);
    expect(result.items).toEqual(createdItems);
  });

  it("deve lançar erro se algum produto não for encontrado", async () => {
    mockSaleRepository.create.mockResolvedValue({ id: "sale-1" });
    mockProductRepository.findManyByIds.mockResolvedValue([]); // nenhum produto retornado

    await expect(
      createSaleService.handle({
        nf_number: "NF123",
        userId: "user-1",
        items: [{ productId: "p1", quantity: 1, value: 10 }],
      })
    ).rejects.toThrowError(/Product not found/);
  });

  it("deve lançar erro se o produto estiver inativo", async () => {
    mockSaleRepository.create.mockResolvedValue({ id: "sale-1" });
    mockProductRepository.findManyByIds.mockResolvedValue([
      { id: "p1", name: "P1", is_active: false, quantity_in_stock: 10 },
    ]);

    await expect(
      createSaleService.handle({
        nf_number: "NF123",
        userId: "user-1",
        items: [{ productId: "p1", quantity: 1, value: 10 }],
      })
    ).rejects.toThrowError(/is inactive/);
  });

  it("deve lançar erro se o estoque for insuficiente", async () => {
    mockSaleRepository.create.mockResolvedValue({ id: "sale-1" });
    mockProductRepository.findManyByIds.mockResolvedValue([
      { id: "p1", name: "P1", is_active: true, quantity_in_stock: 1 },
    ]);

    await expect(
      createSaleService.handle({
        nf_number: "NF123",
        userId: "user-1",
        items: [{ productId: "p1", quantity: 5, value: 10 }],
      })
    ).rejects.toThrowError(/Insufficient stock/);
  });

  it("deve lançar erro se a quantidade em estoque for nula", async () => {
    mockSaleRepository.create.mockResolvedValue({ id: "sale-1" });
    mockProductRepository.findManyByIds.mockResolvedValue([
      { id: "p1", name: "P1", is_active: true, quantity_in_stock: null },
    ]);

    await expect(
      createSaleService.handle({
        nf_number: "NF123",
        userId: "user-1",
        items: [{ productId: "p1", quantity: 1, value: 10 }],
      })
    ).rejects.toThrowError(/undefined/);
  });
});
