import { beforeEach, describe, it, expect } from "vitest";
import { CreateProductService } from "./create-product";
import { InMemoryProductsRepository } from "../../repositories/in-memory/in-memory-products-repository";

let productRepository: InMemoryProductsRepository;
let sut: CreateProductService;

describe('Create Product Service', () => {
    beforeEach(() => {
        productRepository = new InMemoryProductsRepository();
        sut = new CreateProductService(productRepository);
    });

    it('should be able to create a product', async () => {
        await productRepository.create({
            name: 'Product 1',
            description: 'Product 1 description',
            price: 100,
            quantity_in_stock: 10,
            batch: 'ABC123'
        });

        const { product } = await sut.handle({
            name: 'Product 2',
            description: 'Product 2 description',
            price: 200,
            quantity_in_stock: 20,
            batch: 'DEF456'
        });

        expect(product.id).toEqual(expect.any(String));
    });
});
