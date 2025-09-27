import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { findEmployeeById } from "./find-by-id";
import { makeFindEmployeeByIdService } from "../../../services/factories/employee/make-find-employee-by-id-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/employee/make-find-employee-by-id-service");

describe("findEmployeeById controller", () => {
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("deve retornar 200 e o funcionário encontrado", async () => {
    const mockEmployee = { id: "1", name: "John Doe", email: "john@example.com" };

    const mockService = {
      execute: vi.fn().mockResolvedValueOnce({ employee: mockEmployee }),
    };
    (makeFindEmployeeByIdService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = { params: { id: "1" } } as unknown as FastifyRequest;

    await findEmployeeById(mockRequest, mockReply as FastifyReply);

    expect(mockService.execute).toHaveBeenCalledWith({ id: "1" });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ employee: mockEmployee });
  });

  it("deve retornar 404 se o funcionário não for encontrado", async () => {
    const mockService = {
      execute: vi.fn().mockRejectedValueOnce(new NoRecordsFoundError()),
    };
    (makeFindEmployeeByIdService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = { params: { id: "999" } } as unknown as FastifyRequest;

    await findEmployeeById(mockRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "No records found.",
    });
  });

  it("deve lançar erro se o parâmetro id for inválido", async () => {
    const mockRequest = { params: { id: 123 } } as unknown as FastifyRequest; // inválido (não é string)

    await expect(
      findEmployeeById(mockRequest, mockReply as FastifyReply)
    ).rejects.toThrow(); // ZodError

    expect(mockReply.status).not.toHaveBeenCalled();
  });
});