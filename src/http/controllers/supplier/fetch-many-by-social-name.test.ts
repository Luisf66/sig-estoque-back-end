import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchManyBySocialName } from "./fetch-many-by-social-name";
import { makeFetchManySupplierBySocialNameService } from "../../../services/factories/supplier/make-fetch-many-by-social-name";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/supplier/make-fetch-many-by-social-name");

describe("fetchManyBySocialName Controller", () => {
  let mockFetchManyBySocialNameService: { execute: vi.Mock };

  beforeEach(() => {
    mockFetchManyBySocialNameService = {
      execute: vi.fn().mockResolvedValue({
        supplier: [
          {
            id: "supplier-1",
            social_name: "Social Name 1",
            company_name: "Company 1",
            phone_number: "123456789",
            cnpj: "11111111000111",
          },
          {
            id: "supplier-2",
            social_name: "Social Name 2",
            company_name: "Company 2",
            phone_number: "987654321",
            cnpj: "22222222000222",
          },
        ],
      }),
    };

    vi.mocked(makeFetchManySupplierBySocialNameService).mockReturnValue(mockFetchManyBySocialNameService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar os fornecedores pelo nome social com status 200", async () => {
    const request = {
      params: { socialName: "Social Name 1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchManyBySocialName(request, reply);

    expect(mockFetchManyBySocialNameService.execute).toHaveBeenCalledWith({
      socialName: "Social Name 1",
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      supplier: [
        {
          id: "supplier-1",
          social_name: "Social Name 1",
          company_name: "Company 1",
          phone_number: "123456789",
          cnpj: "11111111000111",
        },
        {
          id: "supplier-2",
          social_name: "Social Name 2",
          company_name: "Company 2",
          phone_number: "987654321",
          cnpj: "22222222000222",
        },
      ],
    });
  });

  it("deve retornar erro 500 em caso de falha", async () => {
    mockFetchManyBySocialNameService.execute.mockRejectedValue(new Error("Erro ao buscar fornecedores"));

    const request = {
      params: { socialName: "Social Name 1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchManyBySocialName(request, reply);

    expect(mockFetchManyBySocialNameService.execute).toHaveBeenCalledWith({
      socialName: "Social Name 1",
    });
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "An error occurred while fetching suppliers",
      statusCode: 500,
    });
  });
});
