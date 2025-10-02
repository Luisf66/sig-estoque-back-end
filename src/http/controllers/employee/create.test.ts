import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { createEmployee } from "./create";
import { makeCreateEmployeeService } from "../../../services/factories/employee/make-create-employee-service";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";

vi.mock("../../../services/factories/employee/make-create-employee-service");

describe("createEmployee controller", () => {
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("deve criar um funcionário com sucesso", async () => {
    const mockService = { execute: vi.fn().mockResolvedValueOnce(undefined) };
    (makeCreateEmployeeService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = {
      body: { name: "John Doe", email: "john@example.com", password: "123456" },
    } as FastifyRequest;

    await createEmployee(mockRequest, mockReply as FastifyReply);

    expect(mockService.execute).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("deve retornar 409 se o usuário já existir", async () => {
    const mockService = {
      execute: vi.fn().mockRejectedValueOnce(new UserAlreadyExistsError()),
    };
    (makeCreateEmployeeService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = {
      body: { name: "Jane Doe", email: "jane@example.com", password: "123456" },
    } as FastifyRequest;

    await createEmployee(mockRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "E-mail already exists.",
    });
  });

  it("deve lançar erro se os dados forem inválidos", async () => {
    const mockRequest = {
      body: { name: "Invalid User", email: "not-an-email", password: "123" },
    } as FastifyRequest;

    await expect(
      createEmployee(mockRequest, mockReply as FastifyReply)
    ).rejects.toThrow(); // ZodError

    expect(mockReply.status).not.toHaveBeenCalled();
  });
  it("deve relançar erros inesperados", async () => {
    const mockService = {
      execute: vi.fn().mockRejectedValueOnce(new Error("Unexpected error")),
    };
    (makeCreateEmployeeService as vi.Mock).mockReturnValue(mockService);

    const mockRequest = {
      body: { name: "John Doe", email: "john@example.com", password: "123456" },
    } as FastifyRequest;

    await expect(
      createEmployee(mockRequest, mockReply as FastifyReply)
    ).rejects.toThrow("Unexpected error");

    expect(mockReply.status).not.toHaveBeenCalled();
  });
});