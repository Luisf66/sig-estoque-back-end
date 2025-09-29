import { describe, it, expect, beforeEach } from "vitest";
import { CreateProductService } from "./create-product";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";

describe("CreateProductService", () => {
  let productsRepository: InMemoryProductsRepository;
  let sut: CreateProductService;

  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new CreateProductService(productsRepository);
  });

  it("deve criar um novo produto com sucesso", async () => {
    const response = await sut.handle({
      name: "Produto Teste",
      description: "Um produto de teste",
      price: 100.5,
      quantity_in_stock: 10,
      batch: "Lote A",
    });

    expect(response.product).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "Produto Teste",
        description: "Um produto de teste",
        price: 100.5,
        quantity_in_stock: 10,
        batch: "Lote A",
      })
    );

    // Verifica se realmente foi salvo no repositório
    const allProducts = await productsRepository.findMany();
    expect(allProducts).toHaveLength(1);
    expect(allProducts[0].name).toBe("Produto Teste");
  });

  it("deve permitir criar múltiplos produtos", async () => {
    await sut.handle({
      name: "Produto 1",
      description: "Desc 1",
      price: 10,
      quantity_in_stock: 5,
      batch: "L1",
    });

    await sut.handle({
      name: "Produto 2",
      description: "Desc 2",
      price: 20,
      quantity_in_stock: 15,
      batch: "L2",
    });

    const products = await productsRepository.findMany();
    expect(products).toHaveLength(2);
    expect(products.map(p => p.name)).toEqual(["Produto 1", "Produto 2"]);
  });
});
