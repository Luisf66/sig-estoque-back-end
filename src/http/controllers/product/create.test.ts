import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { createProduct } from "./create";
import { makeCreateProductService } from "../../../services/factories/product/make-create-product-service";

vi.mock("../../../services/factories/product/make-create-product-service");

describe("CreateProduct Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let codeMock: any;
  let sendMock: any;

  beforeEach(() => {
    mockRequest = {};
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();
    mockReply = {
      code: codeMock,
      send: sendMock,
    };
    vi.clearAllMocks();
  });

  it("deve criar um produto com sucesso", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Produto Teste",
      description: "Descrição teste",
      price: 100,
      quantity_in_stock: 10,
      batch: "ABC123",
    };

    const mockServiceHandle = vi.fn().mockResolvedValue({
      product: mockProduct,
    });

    (makeCreateProductService as any).mockReturnValue({
      handle: mockServiceHandle,
    });

    mockRequest.body = {
      name: "Produto Teste",
      description: "Descrição teste",
      price: 100,
      quantity_in_stock: 10,
    };

    await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockServiceHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Produto Teste",
        description: "Descrição teste",
        price: 100,
        quantity_in_stock: 10,
        batch: expect.any(String),
      })
    );

    expect(codeMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalledWith({
      product: mockProduct,
    });
  });

  it("deve lançar erro se os dados forem inválidos", async () => {
    mockRequest.body = {
      name: "Produto Teste",
      description: "Descrição teste",
      price: "preço inválido", // ❌ não é número → Zod deve lançar
      quantity_in_stock: 10,
    };

    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow();

    expect(codeMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
