import { describe, it, expect, vi } from "vitest";
import { createSale } from "./create";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateSaleService } from "../../../services/factories/sale/make-create-sale-service";

vi.mock("../../../services/factories/sale/make-create-sale-service");

describe("createSale Controller", () => {
  it("deve criar uma nova venda com sucesso", async () => {
    const mockCreateSaleService = {
      handle: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(makeCreateSaleService).mockReturnValue(mockCreateSaleService);

    const request = {
      body: {
        nf_number: "NF123",
        userId: "user-1",
        items: [
          { productId: "product-1", quantity: 2, value: 50 },
          { productId: "product-2", quantity: 1, value: 100 },
        ],
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createSale(request, reply);

    expect(mockCreateSaleService.handle).toHaveBeenCalledWith({
      nf_number: "NF123",
      userId: "user-1",
      items: [
        { productId: "product-1", quantity: 2, value: 50 },
        { productId: "product-2", quantity: 1, value: 100 },
      ],
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it("deve retornar erro 400 se o payload for inválido", async () => {
    const request = {
      body: {
        // Payload inválido (falta userId)
        nf_number: "NF123",
        items: [
          { productId: "product-1", quantity: 2, value: 50 },
        ],
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createSale(request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Invalid request payload",
    });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    const mockCreateSaleService = {
      handle: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeCreateSaleService).mockReturnValue(mockCreateSaleService);

    const request = {
      body: {
        nf_number: "NF123",
        userId: "user-1",
        items: [
          { productId: "product-1", quantity: 2, value: 50 },
          { productId: "product-2", quantity: 1, value: 100 },
        ],
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createSale(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
