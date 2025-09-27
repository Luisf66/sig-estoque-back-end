import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { inactivateProduct } from "./inactivate";
import { makeInactivateProductService } from "../../../services/factories/product/make-inactivate-product-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/product/make-inactivate-product-service");

describe("InactivateProduct Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: any;
  let codeMock: any;
  let sendMock: any;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();

    mockRequest = {};
    mockReply = {
      status: statusMock,
      code: codeMock,
      send: sendMock,
    };

    vi.clearAllMocks();
  });

  it("deve inativar o produto com sucesso (204)", async () => {
    const mockExecute = vi.fn().mockResolvedValue({});
    (makeInactivateProductService as any).mockReturnValue({
      execute: mockExecute,
    });

    mockRequest.params = { id: "prod-1" };

    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockExecute).toHaveBeenCalledWith({ productId: "prod-1" });
    expect(codeMock).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalled();
  });

  it("deve retornar 404 se o produto não for encontrado", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new NoRecordsFoundError());
    (makeInactivateProductService as any).mockReturnValue({
      execute: mockExecute,
    });

    mockRequest.params = { id: "prod-404" };

    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "No records found." });
  });

  it("deve retornar 404 se o parâmetro id estiver ausente", async () => {
    // Nesse caso, o comportamento real é tratar como 'não encontrado'
    mockRequest.params = {}; 

    const mockExecute = vi.fn().mockRejectedValue(new NoRecordsFoundError());
    (makeInactivateProductService as any).mockReturnValue({
      execute: mockExecute,
    });

    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "No records found." });
    expect(codeMock).not.toHaveBeenCalled();
  });

  it("deve propagar erros inesperados", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new Error("Erro inesperado"));
    (makeInactivateProductService as any).mockReturnValue({
      execute: mockExecute,
    });

    mockRequest.params = { id: "prod-1" };

    await expect(
      inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Erro inesperado");

    expect(statusMock).not.toHaveBeenCalledWith(404);
  });
});
