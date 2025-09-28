import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { findSaleById } from "./find-by-id";
import { makeFindSaleByIdService } from "../../../services/factories/sale/make-find-sale-by-id-service";

vi.mock("../../../services/factories/sale/make-find-sale-by-id-service", () => {
  return {
    makeFindSaleByIdService: vi.fn(),
  };
});

describe("FindSaleById Controller", () => {
  let codeMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();

    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar a venda com sucesso (200)", async () => {
    const executeMock = vi.fn().mockResolvedValue({
      sale: { id: "sale-1", nf_number: "12345", userId: "user-1" },
    });

    (makeFindSaleByIdService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    const mockRequest = {
      params: { id: "sale-1" },
    } as Partial<FastifyRequest>;

    await findSaleById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalledWith({ saleId: "sale-1" });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      sale: { id: "sale-1", nf_number: "12345", userId: "user-1" },
    });
  });

  it("deve retornar 404 se a venda não for encontrada", async () => {
    const executeMock = vi.fn().mockResolvedValue({ sale: null });

    (makeFindSaleByIdService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    const mockRequest = {
      params: { id: "sale-404" },
    } as Partial<FastifyRequest>;

    await findSaleById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalledWith({ saleId: "sale-404" });
    expect(codeMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "Sale not found" });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error("Erro inesperado"));

    (makeFindSaleByIdService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    const mockRequest = {
      params: { id: "sale-1" },
    } as Partial<FastifyRequest>;

    await findSaleById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalledWith({ saleId: "sale-1" });
    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
