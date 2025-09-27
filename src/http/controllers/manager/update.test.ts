import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { updateManager } from "./update";
import { makeUpdateManagerService } from "../../../services/factories/manager/make-update-manager-service";

vi.mock("../../../services/factories/manager/make-update-manager-service");

describe("UpdateManager Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: any;
  let sendMock: any;

  beforeEach(() => {
    mockRequest = {};
    statusMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();
    mockReply = {
      status: statusMock,
      send: sendMock,
    };
    vi.clearAllMocks();
  });

  it("deve atualizar um gerente com sucesso", async () => {
    const mockServiceExecute = vi.fn().mockResolvedValue({});
    (makeUpdateManagerService as any).mockReturnValue({
      execute: mockServiceExecute,
    });

    mockRequest.body = {
      userId: "user-1",
      name: "Novo Nome",
      email: "novo@email.com",
      password: "123456",
    };

    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockServiceExecute).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Novo Nome",
      email: "novo@email.com",
      password: "123456",
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Manager successfully updated.",
    });
  });

  it("deve retornar 500 se os dados forem inválidos", async () => {
    mockRequest.body = {
        userId: "user-1",
        name: "Nome Inválido",
        email: "email-invalido", // ❌ inválido
    };

    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
        message: "Internal Server Error",
    });
    });

});
