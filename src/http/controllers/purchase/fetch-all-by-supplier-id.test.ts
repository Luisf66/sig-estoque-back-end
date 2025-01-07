import { describe, it, expect, vi } from "vitest";
import { fetchAllPurchaseBySupplierId } from "./fetch-all-by-supplier-id";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchAllPurchaseBySupplierIdService } from "../../../services/factories/purchase/make-fetch-all-purchase-by-supplier-id";

vi.mock("../../../services/factories/purchase/make-fetch-all-purchase-by-supplier-id");

describe("fetchAllPurchaseBySupplierId Controller", () => {
  it("deve retornar erro se o parâmetro supplierId estiver ausente", async () => {
    const request = {
      params: {}, // supplierId ausente
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    try {
      await fetchAllPurchaseBySupplierId(request, reply);
    } catch (error) {
      expect(error).toBeInstanceOf(Error); // Verifica que um erro foi lançado
    }

    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it("deve retornar todas as compras para um supplierId válido", async () => {
    const mockFetchAllPurchaseBySupplierIdService = {
      execute: vi.fn().mockResolvedValue({
        purchases: [
          {
            id: "1",
            supplierId: "123",
            item: "Produto A",
            quantity: 10,
          },
        ],
      }),
    };

    // Mock direto, sem usar `vi.mocked`
    vi.mocked(makeFetchAllPurchaseBySupplierIdService).mockImplementation(
      () => mockFetchAllPurchaseBySupplierIdService
    );

    const request = {
      params: { supplierId: "123" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllPurchaseBySupplierId(request, reply);

    expect(mockFetchAllPurchaseBySupplierIdService.execute).toHaveBeenCalledWith({
      supplierId: "123",
    });

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      purchases: [
        {
          id: "1",
          supplierId: "123",
          item: "Produto A",
          quantity: 10,
        },
      ],
    });
  });
});
