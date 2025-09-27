import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { findPurchaseById } from "./find-by-id";
import { makeFindPurchaseByIdService } from "../../../services/factories/purchase/make-find-purchase-by-id-service";

vi.mock("../../../services/factories/purchase/make-find-purchase-by-id-service");

describe("FindPurchaseById Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let codeMock: any;
  let sendMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn();

    mockRequest = {};
    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  it("deve retornar a compra com sucesso (200)", async () => {
    const fakePurchase = { id: "purchase-1", nf_number: "NF123" };

    const executeMock = vi.fn().mockResolvedValue({ purchase: fakePurchase });
    (makeFindPurchaseByIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest.params = { id: "purchase-1" };

    await findPurchaseById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ purchaseId: "purchase-1" });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ purchase: fakePurchase });
  });

  it('deve retornar 404 se a compra não for encontrada ("Resource not found")', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error("Resource not found"));
    (makeFindPurchaseByIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest.params = { id: "not-found-id" };

    await findPurchaseById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(codeMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Resource not found",
      statusCode: 404,
    });
  });

  it("deve retornar 500 para erros inesperados", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error("Erro inesperado"));
    (makeFindPurchaseByIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest.params = { id: "purchase-1" };

    await findPurchaseById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500,
    });
  });
});
