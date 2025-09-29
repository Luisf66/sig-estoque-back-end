import { describe, it, expect, beforeEach } from "vitest";
import { InactivateProductService } from "./inactivate-product";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";

describe("InactivateProductService", () => {
  let productsRepository: InMemoryProductsRepository;
  let sut: InactivateProductService;

  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new InactivateProductService(productsRepository);
  });

  it("deve inativar um produto existente", async () => {
    const product = await productsRepository.create({
      name: "Produto Ativo",
      description: "Descrição",
      price: 100,
      quantity_in_stock: 50,
      batch: "BATCH-123",
      // is_active true por padrão
    });

    await sut.execute({ productId: product.id });

    // Buscar novamente para verificar se foi inativado
    const updated = await productsRepository.findById(product.id);

    expect(updated).not.toBeNull();
    expect(updated?.is_active).toBe(false);
  });

  it("deve lançar erro se o produto não existir", async () => {
    await expect(
      sut.execute({ productId: "produto-inexistente" })
    ).rejects.toThrowError("Product not found");
  });
});
