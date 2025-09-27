import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { fetchAllPurchase } from "./fetch-all";
import { makeFetchAllPurchaseService } from "../../../services/factories/purchase/make-fetch-all-purchase-service";

vi.mock("../../../services/factories/purchase/make-fetch-all-purchase-service");

describe("FetchAllPurchase Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let codeMock: any;
  let sendMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {};
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn();

    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  it("deve retornar todas as compras com sucesso (200)", async () => {
    const fakePurchases = [
      { id: "1", nf_number: "NF001" },
      { id: "2", nf_number: "NF002" },
    ];

    const executeMock = vi.fn().mockResolvedValue({ purchase: fakePurchases });
    (makeFetchAllPurchaseService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    await fetchAllPurchase(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalled();
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ purchase: fakePurchases });
  });

  it("deve propagar erros inesperados", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error("Erro inesperado"));
    (makeFetchAllPurchaseService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    await expect(
      fetchAllPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Erro inesperado");

    expect(codeMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
