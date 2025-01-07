import { describe, it, expect, vi } from "vitest";
import { updateEmployee } from "./update";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeUpdateEmployeeService } from "../../../services/factories/employee/make-update-employee-service";

vi.mock("../../../services/factories/employee/make-update-employee-service");

describe("updateEmployee Controller", () => {
  it("deve atualizar um funcionário com sucesso e retornar status 200", async () => {
    // Mock do serviço
    const mockUpdateEmployeeService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(makeUpdateEmployeeService).mockReturnValue(mockUpdateEmployeeService);

    // Mock do request e reply
    const request = {
      body: {
        userId: "1",
        name: "João Atualizado",
        email: "joao.atualizado@email.com",
        password: "newpassword",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await updateEmployee(request, reply);

    expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
      userId: "1",
      name: "João Atualizado",
      email: "joao.atualizado@email.com",
      password: "newpassword",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Employee successfully updated.",
    });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    // Mock do serviço para lançar erro genérico
    const mockUpdateEmployeeService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };
    vi.mocked(makeUpdateEmployeeService).mockReturnValue(mockUpdateEmployeeService);

    const request = {
      body: {
        userId: "2",
        name: "Carlos",
        email: "carlos@email.com",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await updateEmployee(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it("deve lançar erro de validação ao receber dados inválidos", async () => {
    // Mock do serviço
    const mockUpdateEmployeeService = {
      execute: vi.fn(),
    };
    vi.mocked(makeUpdateEmployeeService).mockReturnValue(mockUpdateEmployeeService);
  
    const request = {
      body: {
        userId: "3",
        name: "",
        email: "email-invalido",
      },
    } as unknown as FastifyRequest;
  
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    try {
      await updateEmployee(request, reply);
      throw new Error("Invalid");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("Invalid");
      expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
    }
  });
});
