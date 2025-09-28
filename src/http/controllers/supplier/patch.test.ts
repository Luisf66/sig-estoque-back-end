import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Fastify from "fastify";
import { patchSupplier } from "./patch";
import * as factoryModule from "../../../services/factories/supplier/make-patch-supplier-service";

describe("patchSupplier controller", () => {
  const fastify = Fastify();

  // Criamos uma rota temporária para testar o controlador isoladamente
  fastify.patch("/suppliers/:id", patchSupplier);

  const mockHandle = vi.fn();

  beforeEach(() => {
    vi.spyOn(factoryModule, "makePatchSupplierService").mockReturnValue({
      handle: mockHandle,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockHandle.mockReset();
  });

  it("deve atualizar parcialmente um fornecedor com sucesso", async () => {
    const supplierId = "123e4567-e89b-12d3-a456-426614174000";

    mockHandle.mockResolvedValueOnce({
      supplier: {
        id: supplierId,
        social_name: "Novo Nome Social",
        company_name: "Empresa Atualizada",
        phone_number: "11999999999",
        cnpj: "12345678000199",
      },
    });

    const response = await fastify.inject({
      method: "PATCH",
      url: `/suppliers/${supplierId}`,
      payload: {
        social_name: "Novo Nome Social",
        company_name: "Empresa Atualizada",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.supplier.id).toBe(supplierId);
    expect(mockHandle).toHaveBeenCalledWith({
      id: supplierId,
      data: {
        social_name: "Novo Nome Social",
        company_name: "Empresa Atualizada",
        phone_number: undefined,
        cnpj: undefined,
      },
    });
  });

  it("deve retornar 400 se o corpo for inválido", async () => {
    const supplierId = "123e4567-e89b-12d3-a456-426614174000";

    const response = await fastify.inject({
      method: "PATCH",
      url: `/suppliers/${supplierId}`,
      payload: {
        social_name: 123, // inválido, deveria ser string
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error).toBe("Bad Request");
    expect(mockHandle).not.toHaveBeenCalled();
  });

  it("deve retornar 500 se o serviço lançar um erro inesperado", async () => {
    const supplierId = "123e4567-e89b-12d3-a456-426614174000";

    mockHandle.mockRejectedValueOnce(new Error("Erro interno"));

    const response = await fastify.inject({
      method: "PATCH",
      url: `/suppliers/${supplierId}`,
      payload: {
        social_name: "Nome",
      },
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toBe("Internal Server Error");
  });
});
