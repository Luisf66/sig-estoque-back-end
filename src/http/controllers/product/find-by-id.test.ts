import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { findProductById } from "./find-by-id";
import { makeFindProductByIdService } from "../../../services/factories/product/make-find-product-by-id-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/product/make-find-product-by-id-service");

describe("FindProductById Controller", () => {
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

  it("deve retornar o produto corretamente se o ID for válido", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Produto Teste",
      description: "Descrição",
      price: 50,
      quantity_in_stock: 10,
    };

    const mockExecute = vi.fn().mockResolvedValue({ product: mockProduct });
    (makeFindProductByIdService as any).mockReturnValue({
      execute: mockExecute,
    });

    mockRequest.params = { id: "prod-1" };

    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockExecute).toHaveBeenCalledWith({ productId: "prod-1" });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ product: mockProduct });
  });

  it("deve retornar 404 se nenhum registro for encontrado", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new NoRecordsFoundError());
    (makeFindProductByIdService as any).mockReturnValue({
      execute: mockExecute,
    });

    mockRequest.params = { id: "prod-999" };

    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "No records found." });
  });

  it("deve lançar erro se os parâmetros forem inválidos", async () => {
    mockRequest.params = {}; // ❌ faltando id

    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(); // Zod lança erro de validação

    expect(statusMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("deve propagar outros erros não tratados", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new Error("Erro inesperado"));
    (makeFindProductByIdService as any).mockReturnValue({
      execute: mockExecute,
    });

    mockRequest.params = { id: "prod-1" };

    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Erro inesperado");

    expect(statusMock).not.toHaveBeenCalledWith(404);
    expect(sendMock).not.toHaveBeenCalledWith({ message: "No records found." });
  });
});
