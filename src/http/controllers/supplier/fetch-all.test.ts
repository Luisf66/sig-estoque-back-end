import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchAllSupplier } from "./fetch-all";
import { makeFetchAllSupplierService } from "../../../services/factories/supplier/make-fetch-all-supplier-service";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/supplier/make-fetch-all-supplier-service");

describe("fetchAllSupplier Controller", () => {
  let mockFetchAllSupplierService: { execute: vi.Mock };

  beforeEach(() => {
    mockFetchAllSupplierService = {
      execute: vi.fn().mockResolvedValue({
        supplier: [
          {
            id: "supplier-1",
            social_name: "Supplier 1",
            company_name: "Company 1",
            phone_number: "123456789",
            cnpj: "11111111000111",
          },
          {
            id: "supplier-2",
            social_name: "Supplier 2",
            company_name: "Company 2",
            phone_number: "987654321",
            cnpj: "22222222000222",
          },
        ],
      }),
    };

    vi.mocked(makeFetchAllSupplierService).mockReturnValue(mockFetchAllSupplierService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar todos os fornecedores com status 200", async () => {
    // Mock do objeto FastifyRequest
    const request = {} as unknown as FastifyRequest;

    // Mock do objeto FastifyReply
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // Chamar a função do controlador
    await fetchAllSupplier(request, reply);

    // Garantir que o serviço foi chamado
    expect(mockFetchAllSupplierService.execute).toHaveBeenCalled();

    // Garantir que a resposta foi 200
    expect(reply.code).toHaveBeenCalledWith(200);

    // Garantir que a resposta contém os fornecedores esperados
    expect(reply.send).toHaveBeenCalledWith({
      supplier: [
        {
          id: "supplier-1",
          social_name: "Supplier 1",
          company_name: "Company 1",
          phone_number: "123456789",
          cnpj: "11111111000111",
        },
        {
          id: "supplier-2",
          social_name: "Supplier 2",
          company_name: "Company 2",
          phone_number: "987654321",
          cnpj: "22222222000222",
        },
      ],
    });
  });
});
