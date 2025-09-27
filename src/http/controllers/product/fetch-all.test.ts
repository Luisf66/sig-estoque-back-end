import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { fetchAllProduct } from "./fetch-all";
import { makeFetchAllProductService } from "../../../services/factories/product/make-fetch-all-product-service";

vi.mock("../../../services/factories/product/make-fetch-all-product-service");

describe("FetchAllProduct Controller", () => {
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

  it("deve retornar todos os produtos com sucesso", async () => {
    const mockProducts = [
      { id: "1", name: "Produto 1", description: "Desc 1", price: 10, quantity_in_stock: 5 },
      { id: "2", name: "Produto 2", description: "Desc 2", price: 20, quantity_in_stock: 15 },
    ];

    const mockServiceExecute = vi.fn().mockResolvedValue({
      product: mockProducts,
    });

    (makeFetchAllProductService as any).mockReturnValue({
      execute: mockServiceExecute,
    });

    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockServiceExecute).toHaveBeenCalled();
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      product: mockProducts,
    });
  });

  it("deve retornar erro 500 se o serviço lançar exceção", async () => {
    const mockServiceExecute = vi.fn().mockRejectedValue(new Error("Erro interno"));

    (makeFetchAllProductService as any).mockReturnValue({
      execute: mockServiceExecute,
    });

    await expect(
      fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Erro interno");

    expect(codeMock).not.toHaveBeenCalledWith(200);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
