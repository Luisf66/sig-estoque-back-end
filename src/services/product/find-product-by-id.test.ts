import { describe, it, expect, beforeEach } from "vitest";
import { FindProductByIdService } from "./find-product-by-id";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { InactiveError } from "../errors/inactive-error";

describe("FindProductByIdService", () => {
  let productsRepository: InMemoryProductsRepository;
  let sut: FindProductByIdService;

  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new FindProductByIdService(productsRepository);
  });

  it("deve retornar o produto quando ele existir e estiver ativo", async () => {
    const product = await productsRepository.create({
      name: "Produto Teste",
      description: "Descrição",
      price: 100,
      quantity_in_stock: 20,
      batch: "BATCH-1",
      // is_active omitido → repositório deve definir true por padrão
    });

    const response = await sut.execute({ productId: product.id });

    expect(response.product).toEqual(
      expect.objectContaining({
        id: product.id,
        name: "Produto Teste",
        is_active: true,
      })
    );
  });

  it("deve lançar ResourceNotFoundError se o produto não existir", async () => {
    await expect(
      sut.execute({ productId: "produto-inexistente" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar InactiveError se o produto estiver inativo", async () => {
    // Cria o produto já inativo (evita depender de um método update inexistente)
    const product = await productsRepository.create({
      name: "Produto Inativo",
      description: "Descrição",
      price: 50,
      quantity_in_stock: 10,
      batch: "BATCH-2",
      is_active: false, // cria diretamente como inativo
    });

    await expect(
      sut.execute({ productId: product.id })
    ).rejects.toBeInstanceOf(InactiveError);
  });
});
