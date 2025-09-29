import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllProductService } from "./fetch-all-product";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";

describe("FetchAllProductService", () => {
  let productsRepository: InMemoryProductsRepository;
  let sut: FetchAllProductService;

  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new FetchAllProductService(productsRepository);
  });

  it("deve retornar uma lista vazia quando não houver produtos", async () => {
    const response = await sut.execute();
    expect(response.product).toEqual([]);
  });

  it("deve retornar todos os produtos cadastrados", async () => {
    await productsRepository.create({
      name: "Produto 1",
      description: "Descrição 1",
      price: 10,
      quantity_in_stock: 5,
      batch: "L1",
    });

    await productsRepository.create({
      name: "Produto 2",
      description: "Descrição 2",
      price: 20,
      quantity_in_stock: 10,
      batch: "L2",
    });

    const response = await sut.execute();

    expect(response.product).toHaveLength(2);
    expect(response.product).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Produto 1", batch: "L1" }),
        expect.objectContaining({ name: "Produto 2", batch: "L2" }),
      ])
    );
  });
});
