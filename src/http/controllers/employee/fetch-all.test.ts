import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { fetchAllEmployees } from "./fetch-all";
import { makeFetchAllEmployeesService } from "../../../services/factories/employee/make-fetch-all-employees-service";

vi.mock("../../../services/factories/employee/make-fetch-all-employees-service");

describe("fetchAllEmployees controller", () => {
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("deve retornar 200 e a lista de funcionários", async () => {
    const mockEmployees = [
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Doe", email: "jane@example.com" },
    ];

    const mockService = {
      execute: vi.fn().mockResolvedValueOnce({ employee: mockEmployees }),
    };
    (makeFetchAllEmployeesService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = {} as FastifyRequest;

    await fetchAllEmployees(mockRequest, mockReply as FastifyReply);

    expect(mockService.execute).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ employee: mockEmployees });
  });

  it("deve retornar 500 se o serviço lançar erro", async () => {
    const mockService = {
      execute: vi.fn().mockRejectedValueOnce(new Error("DB error")),
    };
    (makeFetchAllEmployeesService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = {} as FastifyRequest;

    await fetchAllEmployees(mockRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});