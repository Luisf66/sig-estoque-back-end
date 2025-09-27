import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { updateEmployee } from "./update";
import { makeUpdateEmployeeService } from "../../../services/factories/employee/make-update-employee-service";

vi.mock("../../../services/factories/employee/make-update-employee-service");

describe("updateEmployee controller", () => {
  it("deve atualizar um funcionário com sucesso", async () => {
    const mockRequest = {
      body: {
        userId: "123",
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const mockService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    (makeUpdateEmployeeService as unknown as vi.Mock).mockReturnValue(mockService);

    await updateEmployee(mockRequest, mockReply);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: "123",
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
    });

    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Employee successfully updated.",
    });
  });

  it("deve retornar erro se os dados forem inválidos", async () => {
    const mockRequest = {
      body: {
        userId: "123",
        name: "", // inválido
        email: "invalid-email", // inválido
        password: "123", // inválido
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await updateEmployee(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it("deve retornar erro 500 se o serviço lançar exceção", async () => {
    const mockRequest = {
      body: {
        userId: "123",
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const mockService = {
      execute: vi.fn().mockRejectedValue(new Error("DB error")),
    };

    (makeUpdateEmployeeService as unknown as vi.Mock).mockReturnValue(mockService);

    await updateEmployee(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});