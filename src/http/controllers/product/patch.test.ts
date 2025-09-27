import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { patchProduct } from "./patch";
import { makePatchProductService } from "../../../services/factories/product/make-patch-product-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/product/make-patch-product-service");

describe("PatchProduct Controller", () => {
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

  it("deve atualizar parcialmente o produto com sucesso (200)", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Produto Atualizado",
      description: "Nova descrição",
      price: 123,
      quantity_in_stock: 50,
      batch: "ABC123",
    };

    const mockHandle = vi.fn().mockResolvedValue({ product: mockProduct });
    (makePatchProductService as any).mockReturnValue({
      handle: mockHandle,
    });

    mockRequest.params = { id: "prod-1" };
    mockRequest.body = {
      name: "Produto Atualizado",
      price: 123,
    };

    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockHandle).toHaveBeenCalledWith({
      id: "prod-1",
      data: expect.objectContaining({
        name: "Produto Atualizado",
        price: 123,
      }),
    });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ product: mockProduct });
  });

  it("deve retornar 404 se o produto não for encontrado", async () => {
    const mockHandle = vi.fn().mockRejectedValue(new NoRecordsFoundError());
    (makePatchProductService as any).mockReturnValue({
      handle: mockHandle,
    });

    mockRequest.params = { id: "prod-404" };
    mockRequest.body = { name: "Qualquer" };

    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "No records found." });
  });

  it("deve lançar erro se o corpo contiver dados inválidos", async () => {
    mockRequest.params = { id: "prod-1" };
    mockRequest.body = {
      price: "não é número", // ❌ inválido
    };

    await expect(
      patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow();

    expect(statusMock).not.toHaveBeenCalled();
    expect(codeMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("deve retornar 404 se o parâmetro id estiver ausente", async () => {
    mockRequest.params = {}; // ❌
    mockRequest.body = { name: "Novo nome" };

    const mockHandle = vi.fn().mockRejectedValue(new NoRecordsFoundError());
    (makePatchProductService as any).mockReturnValue({
      handle: mockHandle,
    });

    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "No records found." });
    expect(codeMock).not.toHaveBeenCalled();
  });

  it("deve propagar erros inesperados", async () => {
    const mockHandle = vi.fn().mockRejectedValue(new Error("Erro inesperado"));
    (makePatchProductService as any).mockReturnValue({
      handle: mockHandle,
    });

    mockRequest.params = { id: "prod-1" };
    mockRequest.body = { name: "Teste" };

    await expect(
      patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Erro inesperado");

    expect(statusMock).not.toHaveBeenCalledWith(404);
  });
});
