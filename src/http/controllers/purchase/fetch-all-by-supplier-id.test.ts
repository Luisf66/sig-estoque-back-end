import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { fetchAllPurchaseBySupplierId } from "./fetch-all-by-supplier-id";
import { makeFetchAllPurchaseBySupplierIdService } from "../../../services/factories/purchase/make-fetch-all-purchase-by-supplier-id";

vi.mock("../../../services/factories/purchase/make-fetch-all-purchase-by-supplier-id");

describe("FetchAllPurchaseBySupplierId Controller", () => {
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

  it("deve retornar as compras corretamente para um supplierId válido", async () => {
    const fakePurchases = [
      { id: "1", nf_number: "NF001" },
      { id: "2", nf_number: "NF002" },
    ];

    const executeMock = vi.fn().mockResolvedValue({ purchases: fakePurchases });
    (makeFetchAllPurchaseBySupplierIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest = {
      params: { supplierId: "supplier-123" },
    };

    await fetchAllPurchaseBySupplierId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ supplierId: "supplier-123" });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ purchases: fakePurchases });
  });

  it("deve lançar erro se o supplierId estiver ausente", async () => {
    const executeMock = vi.fn().mockImplementation(({ supplierId }) => {
      if (!supplierId) {
        throw new Error("Missing supplierId");
      }
    });

    (makeFetchAllPurchaseBySupplierIdService as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest = {
      params: {}, // ausência do supplierId
    };

    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow("Missing supplierId");

    expect(codeMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
