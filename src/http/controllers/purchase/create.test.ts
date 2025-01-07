import { describe, it, expect, vi } from "vitest";
import { createPurchase } from "./create";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeCreatePurchaseService } from "../../../services/factories/purchase/make-create-purchase-service";

vi.mock("../../../services/factories/purchase/make-create-purchase-service");

describe("createPurchase Controller", () => {
  it("deve criar uma compra com sucesso", async () => {
    const mockCreatePurchaseService = {
      handle: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(makeCreatePurchaseService).mockReturnValue(mockCreatePurchaseService);

    const request = {
      body: {
        nf_number: "NF123456",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          { productId: "product-1", quantity: 10, value: 100 },
          { productId: "product-2", quantity: 5, value: 50 },
        ],
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createPurchase(request, reply);

    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: "NF123456",
      supplierId: "supplier-1",
      userId: "user-1",
      items: [
        { productId: "product-1", quantity: 10, value: 100 },
        { productId: "product-2", quantity: 5, value: 50 },
      ],
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it("deve lançar erro de validação para corpo de requisição inválido", async () => {
    const request = {
      body: {
        nf_number: "NF123456",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          { productId: "product-1", quantity: "dez", value: 100 }, // Erro: quantidade não é um número
        ],
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(createPurchase(request, reply)).rejects.toThrowError();

    expect(reply.status).not.toHaveBeenCalledWith(201);
    expect(reply.send).not.toHaveBeenCalled();
  });

  it("deve repassar erros inesperados", async () => {
    const mockCreatePurchaseService = {
      handle: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeCreatePurchaseService).mockReturnValue(mockCreatePurchaseService);

    const request = {
      body: {
        nf_number: "NF123456",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [
          { productId: "product-1", quantity: 10, value: 100 },
        ],
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(createPurchase(request, reply)).rejects.toThrowError("Erro inesperado");

    expect(mockCreatePurchaseService.handle).toHaveBeenCalled();
    expect(reply.status).not.toHaveBeenCalledWith(201);
    expect(reply.send).not.toHaveBeenCalled();
  });
});
