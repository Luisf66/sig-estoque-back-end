import { describe, it, expect, beforeEach } from "vitest";
import { CreatePurchaseService } from "./create-purchase";
import { InMemoryPurchaseRepository } from "../../repositories/in-memory/in-memory-purchase-repository";
import { InMemoryItemRepository } from "../../repositories/in-memory/in-memory-item-repository";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";

let purchaseRepository: InMemoryPurchaseRepository;
let itemRepository: InMemoryItemRepository;
let productRepository: InMemoryProductsRepository;
let createPurchaseService: CreatePurchaseService;

describe("Create Purchase Service", () => {
  beforeEach(() => {
    purchaseRepository = new InMemoryPurchaseRepository();
    itemRepository = new InMemoryItemRepository();
    productRepository = new InMemoryProductsRepository();
    createPurchaseService = new CreatePurchaseService(
      purchaseRepository,
      itemRepository,
      productRepository
    );
  });

  it("should create a purchase with valid products", async () => {
    // Cria produtos no repositório
    const product1 = await productRepository.create({
      id: "product1",
      name: "Product 1",
      description: "Product 1 description",
      price: 100,
      quantity_in_stock: 10,
      batch: "ABC123",
      is_active: true,
    });

    const product2 = await productRepository.create({
      id: "product2",
      name: "Product 2",
      description: "Product 2 description",
      price: 200,
      quantity_in_stock: 5,
      batch: "DEF456",
      is_active: true,
    });

    // Cria uma requisição de compra
    const request = {
      nf_number: "123456",
      supplierId: "supplier-1",
      userId: "user-1",
      items: [
        { productId: product1.id, quantity: 2, value: 100 },
        { productId: product2.id, quantity: 1, value: 200 },
      ],
    };

    // Realiza a compra
    const { newPurchase, items } = await createPurchaseService.handle(request);

    // Valida os resultados
    expect(newPurchase.id).toEqual(expect.any(String));
    expect(newPurchase.nf_number).toBe(request.nf_number);
    expect(newPurchase.subTotal).toBe(400);
    expect(items.length).toBe(2);
    expect(items[0].productId).toBe(product1.id);
    expect(items[1].productId).toBe(product2.id);
    expect(items[0].quantity).toBe(2);
    expect(items[1].quantity).toBe(1);
  });

  it("should throw an error if a product is not found", async () => {
    await expect(() =>
      createPurchaseService.handle({
        nf_number: "123456",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          {
            productId: "nonexistent-product",
            quantity: 1,
            value: 100,
          },
        ],
      })
    ).rejects.toThrow("Product not found");
  });

  it("should throw an error if a product is inactive", async () => {
    const inactiveProduct = await productRepository.create({
      id: "inactiveProduct",
      name: "Inactive Product",
      description: "Inactive Product description",
      price: 100,
      quantity_in_stock: 10,
      batch: "GHI789",
      is_active: false,
    });

    await expect(() =>
      createPurchaseService.handle({
        nf_number: "123456",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          {
            productId: inactiveProduct.id,
            quantity: 1,
            value: 100,
          },
        ],
      })
    ).rejects.toThrow(`Product ${inactiveProduct.name} does not exist or is inactive`);
  });
});
