import { describe, it, expect, vi } from "vitest";
import { createProduct } from "./create";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeCreateProductService } from "../../../services/factories/product/make-create-product-service";

vi.mock("../../../services/factories/product/make-create-product-service");

describe("createProduct Controller", () => {
  it("deve criar um produto com dados válidos", async () => {
    const mockCreateProductService = {
      handle: vi.fn().mockResolvedValue({
        product: {
          id: "1",
          name: "Produto Teste",
          description: "Descrição do produto teste",
          price: 100.0,
          quantity_in_stock: 50,
          batch: "ABC123",
        },
      }),
    };

    vi.mocked(makeCreateProductService).mockReturnValue(mockCreateProductService);

    const request = {
      body: {
        name: "Produto Teste",
        description: "Descrição do produto teste",
        price: 100.0,
        quantity_in_stock: 50,
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createProduct(request, reply);

    expect(mockCreateProductService.handle).toHaveBeenCalledWith({
      name: "Produto Teste",
      description: "Descrição do produto teste",
      price: 100.0,
      quantity_in_stock: 50,
      batch: expect.any(String), // Confirma que o batch é uma string gerada aleatoriamente
    });

    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      product: {
        id: "1",
        name: "Produto Teste",
        description: "Descrição do produto teste",
        price: 100.0,
        quantity_in_stock: 50,
        batch: "ABC123",
      },
    });
  });

  it("deve lançar erro de validação para dados inválidos", async () => {
    const request = {
      body: {
        name: "Produto Inválido",
        description: "Descrição inválida",
        price: "invalido", // Valor inválido
        quantity_in_stock: -10, // Valor negativo
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(createProduct(request, reply)).rejects.toThrowError();

    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });
});
