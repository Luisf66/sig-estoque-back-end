import { describe, it, expect, vi } from "vitest";
import { patchProduct } from "./patch";
import { FastifyReply, FastifyRequest } from "fastify";
import { makePatchProductService } from "../../../services/factories/product/make-patch-product-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/product/make-patch-product-service");

describe("patchProduct Controller", () => {
  it("deve atualizar o produto com sucesso", async () => {
    const mockPatchProductService = {
      handle: vi.fn().mockResolvedValue({
        product: {
          id: "1",
          name: "Produto Atualizado",
          description: "Descrição Atualizada",
          price: 100,
          quantity_in_stock: 50,
          batch: "L12345",
        },
      }),
    };

    vi.mocked(makePatchProductService).mockReturnValue(mockPatchProductService);

    const request = {
      params: { id: "1" },
      body: {
        name: "Produto Atualizado",
        description: "Descrição Atualizada",
        price: 100,
        quantity_in_stock: 50,
        batch: "L12345",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await patchProduct(request, reply);

    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: "1",
      data: {
        name: "Produto Atualizado",
        description: "Descrição Atualizada",
        price: 100,
        quantity_in_stock: 50,
        batch: "L12345",
      },
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      product: {
        id: "1",
        name: "Produto Atualizado",
        description: "Descrição Atualizada",
        price: 100,
        quantity_in_stock: 50,
        batch: "L12345",
      },
    });
  });

  it("deve retornar erro 404 se o produto não for encontrado", async () => {
    const mockPatchProductService = {
      handle: vi.fn().mockRejectedValue(new NoRecordsFoundError()),
    };

    vi.mocked(makePatchProductService).mockReturnValue(mockPatchProductService);

    const request = {
      params: { id: "99" },
      body: {
        name: "Novo Nome",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await patchProduct(request, reply);

    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: "99",
      data: { name: "Novo Nome" },
    });
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "No records found." });
  });

  it("deve lançar erro de validação se o corpo da requisição for inválido", async () => {
    const request = {
      params: { id: "1" },
      body: {
        price: "não é um número", // Campo inválido
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(patchProduct(request, reply)).rejects.toThrowError();

    expect(reply.code).not.toHaveBeenCalledWith(200);
    expect(reply.send).not.toHaveBeenCalled();
  });
});
