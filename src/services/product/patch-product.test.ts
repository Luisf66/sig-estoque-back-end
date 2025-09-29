import { describe, it, expect, beforeEach } from "vitest";
import { PatchProductService } from "./patch-product";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { InactiveError } from "../errors/inactive-error";

describe("PatchProductService", () => {
  let productsRepository: InMemoryProductsRepository;
  let sut: PatchProductService;

  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new PatchProductService(productsRepository);
  });

  it("deve atualizar parcialmente um produto ativo com sucesso", async () => {
    const product = await productsRepository.create({
      name: "Produto Original",
      description: "Desc original",
      price: 100,
      quantity_in_stock: 10,
      batch: "BATCH-1",
    });

    const response = await sut.handle({
      id: product.id,
      data: {
        name: "Produto Atualizado",
        price: 150,
      },
    });

    expect(response.product).toEqual(
      expect.objectContaining({
        id: product.id,
        name: "Produto Atualizado",
        price: 150,
        description: "Desc original", // não foi alterado
      })
    );
  });

  it("deve lançar ResourceNotFoundError se o produto não existir", async () => {
    await expect(
      sut.handle({
        id: "produto-inexistente",
        data: { name: "Novo Nome" },
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar InactiveError se o produto estiver inativo", async () => {
    const product = await productsRepository.create({
      name: "Produto Inativo",
      description: "Desc",
      price: 50,
      quantity_in_stock: 5,
      batch: "BATCH-2",
    });

    // Força inativação
    if (typeof productsRepository.inactivate === "function") {
      await productsRepository.inactivate(product.id);
    } else {
      // fallback se não existir método inactivate
      const p = await productsRepository.findById(product.id);
      if (p) {
        p.is_active = false;
      }
    }

    await expect(
      sut.handle({
        id: product.id,
        data: { name: "Tentativa de atualização" },
      })
    ).rejects.toBeInstanceOf(InactiveError);
  });
});
