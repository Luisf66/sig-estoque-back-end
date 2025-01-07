import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { deleteSupplier } from "./delete";
import { makeDeleteSupplierService } from "../../../services/factories/supplier/make-delete-supplier-service";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/supplier/make-delete-supplier-service");

describe("deleteSupplier Controller", () => {
  let mockDeleteSupplierService: { execute: vi.Mock };

  beforeEach(() => {
    mockDeleteSupplierService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(makeDeleteSupplierService).mockReturnValue(mockDeleteSupplierService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve excluir um fornecedor e retornar status 204", async () => {
    // Mock do objeto FastifyRequest com o ID do fornecedor
    const request = {
      params: { id: "supplier-1" },
    } as unknown as FastifyRequest;

    // Mock do objeto FastifyReply
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // Chamar a função do controlador
    await deleteSupplier(request, reply);

    // Garantir que o serviço foi chamado com o ID correto
    expect(mockDeleteSupplierService.execute).toHaveBeenCalledWith({ id: "supplier-1" });

    // Garantir que a resposta foi 204
    expect(reply.code).toHaveBeenCalledWith(204);

    // Garantir que a resposta não contém corpo
    expect(reply.send).toHaveBeenCalledWith();
  });
});
