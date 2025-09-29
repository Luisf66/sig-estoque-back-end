import { describe, it, expect, beforeEach } from "vitest";
import { ReduceProductStockService } from "./reduce-product-stock";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("ReduceProductStockService", () => {
  let productsRepository: InMemoryProductsRepository;
  let sut: ReduceProductStockService;

  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new ReduceProductStockService(productsRepository);
  });

  it("deve reduzir o estoque de um produto com sucesso", async () => {
    const product = await productsRepository.create({
      name: "Produto Estoque",
      description: "Descrição",
      price: 100,
      quantity_in_stock: 10,
      batch: "BATCH-1",
    });

    await sut.execute({
      productId: product.id,
      quantity: 4,
    });

    const updatedProduct = await productsRepository.findById(product.id);
    expect(updatedProduct?.quantity_in_stock).toBe(6);
  });

  it("deve lançar ResourceNotFoundError se o produto não existir", async () => {
    await expect(
      sut.execute({
        productId: "produto-inexistente",
        quantity: 5,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar erro se quantity_in_stock for null", async () => {
    // Criamos um produto e depois forçamos o estoque a null
    const product = await productsRepository.create({
      name: "Produto Sem Estoque",
      description: "Descrição",
      price: 50,
      quantity_in_stock: 5,
      batch: "BATCH-2",
    });

    const found = await productsRepository.findById(product.id);
    if (found) {
      found.quantity_in_stock = null;
    }

    await expect(
      sut.execute({
        productId: product.id,
        quantity: 1,
      })
    ).rejects.toThrowError("Product stock information is missing");
  });

  it("deve lançar erro se a quantidade solicitada for maior que o estoque", async () => {
    const product = await productsRepository.create({
      name: "Produto Limitado",
      description: "Descrição",
      price: 20,
      quantity_in_stock: 3,
      batch: "BATCH-3",
    });

    await expect(
      sut.execute({
        productId: product.id,
        quantity: 5,
      })
    ).rejects.toThrowError("Insufficient stock");
  });
});
