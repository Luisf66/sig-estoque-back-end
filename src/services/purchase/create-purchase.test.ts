import { describe, it, expect, beforeEach } from "vitest";
import { CreatePurchaseService } from "./create-purchase";
import { InMemoryPurchaseRepository } from "../../repositories/in-memory/in-memory-purchase-repository";
import { InMemoryItemRepository } from "../../repositories/in-memory/in-memory-item-repository";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";

describe("CreatePurchaseService", () => {
  let purchasesRepository: InMemoryPurchaseRepository;
  let itemsRepository: InMemoryItemRepository;
  let productsRepository: InMemoryProductsRepository;
  let sut: CreatePurchaseService;

  beforeEach(() => {
    purchasesRepository = new InMemoryPurchaseRepository();
    itemsRepository = new InMemoryItemRepository();
    productsRepository = new InMemoryProductsRepository();

    sut = new CreatePurchaseService(
      purchasesRepository,
      itemsRepository,
      productsRepository
    );
  });

  it("deve criar uma compra com sucesso e atualizar estoque", async () => {
    const product1 = await productsRepository.create({
      name: "Produto 1",
      description: "Desc",
      price: 10,
      quantity_in_stock: 5,
      batch: "BATCH-1",
    });

    const product2 = await productsRepository.create({
      name: "Produto 2",
      description: "Desc",
      price: 20,
      quantity_in_stock: 2,
      batch: "BATCH-2",
    });

    const request = {
      nf_number: "NF-001",
      supplierId: "supplier-123",
      userId: "user-456",
      items: [
        { productId: product1.id, quantity: 3, value: 10 },
        { productId: product2.id, quantity: 2, value: 20 },
      ],
    };

    const response = await sut.handle(request);

    // Compra criada
    expect(response.newPurchase).toEqual(
      expect.objectContaining({
        nf_number: "NF-001",
      })
    );

    // Itens criados
    expect(response.items.length).toBe(2);
    expect(response.items[0]).toHaveProperty("id");
    expect(response.items[1]).toHaveProperty("id");

    // Estoque atualizado
    const updatedProduct1 = await productsRepository.findById(product1.id);
    const updatedProduct2 = await productsRepository.findById(product2.id);

    expect(updatedProduct1?.quantity_in_stock).toBe(8);
    expect(updatedProduct2?.quantity_in_stock).toBe(4);
  });

  it("deve lançar erro se algum produto não for encontrado", async () => {
    const product = await productsRepository.create({
      name: "Produto Existente",
      description: "Desc",
      price: 15,
      quantity_in_stock: 10,
      batch: "BATCH-3",
    });

    const request = {
      nf_number: "NF-002",
      supplierId: "supplier-123",
      userId: "user-456",
      items: [
        { productId: product.id, quantity: 1, value: 15 },
        { productId: "produto-inexistente", quantity: 1, value: 5 },
      ],
    };

    await expect(sut.handle(request)).rejects.toThrowError("Product not found");
  });

  it("deve lançar erro se algum produto estiver inativo", async () => {
    const activeProduct = await productsRepository.create({
      name: "Produto Ativo",
      description: "Desc",
      price: 15,
      quantity_in_stock: 10,
      batch: "BATCH-4",
    });

    const inactiveProduct = await productsRepository.create({
      name: "Produto Inativo",
      description: "Desc",
      price: 25,
      quantity_in_stock: 5,
      batch: "BATCH-5",
    });

    // Força produto inativo
    const found = await productsRepository.findById(inactiveProduct.id);
    if (found) {
      found.is_active = false;
    }

    const request = {
      nf_number: "NF-003",
      supplierId: "supplier-123",
      userId: "user-456",
      items: [
        { productId: activeProduct.id, quantity: 1, value: 15 },
        { productId: inactiveProduct.id, quantity: 1, value: 25 },
      ],
    };

    await expect(sut.handle(request)).rejects.toThrowError(
      /Produto Inativo/
    );
  });
});
