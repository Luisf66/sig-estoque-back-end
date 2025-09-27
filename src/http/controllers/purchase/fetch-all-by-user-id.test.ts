import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { fetchAllPurchaseByUserId } from "./fetch-all-by-user-id";
import { makeFetchAllPurchaseByUserIdService } from "../../../services/factories/purchase/make-fetch-all-purchase-by-user-id";

vi.mock("../../../services/factories/purchase/make-fetch-all-purchase-by-user-id");

describe("FetchAllPurchaseByUserId Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let codeMock: any;
  let sendMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn();

    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  it("deve retornar as compras corretamente para um userId válido", async () => {
    const fakePurchases = [
      { id: "1", nf_number: "NF001" },
      { id: "2", nf_number: "NF002" },
    ];

    const executeMock = vi.fn().mockResolvedValue({ purchases: fakePurchases });
    (makeFetchAllPurchaseByUserIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest = {
      params: { userId: "user-123" },
    };

    await fetchAllPurchaseByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ userId: "user-123" });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ purchases: fakePurchases });
  });

  it("deve lançar erro se o userId estiver ausente", async () => {
    const executeMock = vi.fn().mockImplementation(({ userId }) => {
      if (!userId) {
        throw new Error("Missing userId");
      }
    });

    (makeFetchAllPurchaseByUserIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest = {
      params: {}, // ausência do userId
    };

    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow("Missing userId");

    expect(codeMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
