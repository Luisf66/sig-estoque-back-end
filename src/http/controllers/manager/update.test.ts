import { describe, it, expect, vi } from "vitest";
import { updateManager } from "./update";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeUpdateManagerService } from "../../../services/factories/manager/make-update-manager-service";

vi.mock("../../../services/factories/manager/make-update-manager-service");

describe("updateManager Controller", () => {
  it("deve atualizar o gerente com sucesso e retornar status 200", async () => {
    // Mock do serviço
    const mockUpdateManagerService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(makeUpdateManagerService).mockReturnValue(mockUpdateManagerService);

    // Mock do request e reply
    const request = {
      body: {
        userId: "1",
        name: "João Silva",
        email: "joao.silva@email.com",
        password: "newpassword123",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await updateManager(request, reply);

    expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
      userId: "1",
      name: "João Silva",
      email: "joao.silva@email.com",
      password: "newpassword123",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Manager successfully updated.",
    });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    // Mock do serviço para lançar um erro
    const mockUpdateManagerService = {
      execute: vi.fn().mockRejectedValue(new Error("Unexpected error")),
    };
    vi.mocked(makeUpdateManagerService).mockReturnValue(mockUpdateManagerService);

    const request = {
      body: {
        userId: "2",
        name: "Maria Silva",
        email: "maria.silva@email.com",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await updateManager(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it("deve lançar erro de validação para dados inválidos", async () => {
    // Mock do serviço
    const mockUpdateManagerService = {
      execute: vi.fn(),
    };
    vi.mocked(makeUpdateManagerService).mockReturnValue(mockUpdateManagerService);
  
    const request = {
      body: {
        userId: "3",
        name: "", // Nome inválido (string vazia)
        email: "email_invalido", // Email inválido
        password: "123", // Senha muito curta
      },
    } as unknown as FastifyRequest;
  
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    try {
      await updateManager(request, reply);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Invalid");
    }
  
    expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
  });  
});
