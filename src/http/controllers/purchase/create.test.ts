import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { createPurchase } from "./create";
import { makeCreatePurchaseService } from "../../../services/factories/purchase/make-create-purchase-service";

vi.mock("../../../services/factories/purchase/make-create-purchase-service");

describe("CreatePurchase Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: any;
  let sendMock: any;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();

    mockRequest = {};
    mockReply = {
      status: statusMock,
      send: sendMock,
    };

    vi.clearAllMocks();
  });

  it("deve criar uma compra com sucesso (201)", async () => {
    const mockHandle = vi.fn().mockResolvedValue({});
    (makeCreatePurchaseService as any).mockReturnValue({
      handle: mockHandle,
    });

    mockRequest.body = {
      nf_number: "NF123",
      supplierId: "sup-1",
      userId: "user-1",
      items: [
        { productId: "prod-1", quantity: 10, value: 50 },
        { productId: "prod-2", quantity: 5, value: 100 },
      ],
    };

    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockHandle).toHaveBeenCalledWith({
      nf_number: "NF123",
      supplierId: "sup-1",
      userId: "user-1",
      items: [
        { productId: "prod-1", quantity: 10, value: 50 },
        { productId: "prod-2", quantity: 5, value: 100 },
      ],
    });
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalled();
  });

  it("deve lançar erro se os dados forem inválidos", async () => {
    mockRequest.body = {
      nf_number: "NF123",
      supplierId: "sup-1",
      userId: "user-1",
      items: [
        { productId: "prod-1", quantity: "não é número", value: 50 }, // ❌ quantity inválido
      ],
    };

    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow();

    expect(statusMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("deve propagar erros inesperados", async () => {
    const mockHandle = vi.fn().mockRejectedValue(new Error("Erro inesperado"));
    (makeCreatePurchaseService as any).mockReturnValue({
      handle: mockHandle,
    });

    mockRequest.body = {
      nf_number: "NF123",
      supplierId: "sup-1",
      userId: "user-1",
      items: [
        { productId: "prod-1", quantity: 10, value: 50 },
      ],
    };

    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Erro inesperado");

    expect(statusMock).not.toHaveBeenCalledWith(201);
  });
});
