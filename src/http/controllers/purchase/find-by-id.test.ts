import { describe, it, expect, vi } from "vitest";
import { findPurchaseById } from "./find-by-id";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFindPurchaseByIdService } from "../../../services/factories/purchase/make-find-purchase-by-id-service";

vi.mock("../../../services/factories/purchase/make-find-purchase-by-id-service");

describe("findPurchaseById Controller", () => {
  it("deve retornar a compra correspondente ao ID fornecido", async () => {
    const mockFindPurchaseByIdService = {
      execute: vi.fn().mockResolvedValue({
        purchase: {
          id: "purchase-1",
          nf_number: "NF123",
          supplierId: "supplier-1",
          userId: "user-1",
          items: [],
        },
      }),
    };

    vi.mocked(makeFindPurchaseByIdService).mockReturnValue(mockFindPurchaseByIdService);

    const request = {
      params: { id: "purchase-1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findPurchaseById(request, reply);

    expect(mockFindPurchaseByIdService.execute).toHaveBeenCalledWith({
      purchaseId: "purchase-1",
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      purchase: {
        id: "purchase-1",
        nf_number: "NF123",
        supplierId: "supplier-1",
        userId: "user-1",
        items: [],
      },
    });
  });

  it("deve retornar erro 404 quando o recurso não for encontrado", async () => {
    const mockFindPurchaseByIdService = {
      execute: vi.fn().mockRejectedValue(new Error("Resource not found")),
    };

    vi.mocked(makeFindPurchaseByIdService).mockReturnValue(mockFindPurchaseByIdService);

    const request = {
      params: { id: "invalid-id" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findPurchaseById(request, reply);

    expect(mockFindPurchaseByIdService.execute).toHaveBeenCalledWith({
      purchaseId: "invalid-id",
    });
    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Resource not found",
      statusCode: 404,
    });
  });

  it("deve retornar erro 500 para erros inesperados", async () => {
    const mockFindPurchaseByIdService = {
      execute: vi.fn().mockRejectedValue(new Error("Unexpected error")),
    };

    vi.mocked(makeFindPurchaseByIdService).mockReturnValue(mockFindPurchaseByIdService);

    const request = {
      params: { id: "purchase-1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findPurchaseById(request, reply);

    expect(mockFindPurchaseByIdService.execute).toHaveBeenCalledWith({
      purchaseId: "purchase-1",
    });
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500,
    });
  });
});
