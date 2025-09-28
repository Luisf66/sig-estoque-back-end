import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { findUserByid } from "./find-by-id";
import { makeGetUserByIdService } from "../../../services/factories/user/make-get-user-by-id";
import { ResourceNotFoundError } from "../../../services/errors/resource-not-found-error";

vi.mock("../../../services/factories/user/make-get-user-by-id");

describe("findUserByid Controller", () => {
  let request: any;
  let reply: any;
  let statusMock: any;
  let sendMock: any;
  let codeMock: any;
  let executeMock: any;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn();

    reply = {
      status: statusMock,
      send: sendMock,
      code: codeMock,
    };

    executeMock = vi.fn();
    (makeGetUserByIdService as any).mockReturnValue({
      execute: executeMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 200 e o usuário quando encontrado", async () => {
    request = {
      params: { id: "user-1" },
    };

    const user = { id: "user-1", name: "John Doe" };
    executeMock.mockResolvedValue({ user });

    await findUserByid(request, reply);

    expect(executeMock).toHaveBeenCalledWith({ userId: "user-1" });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({ user });
  });

  it("deve retornar 404 se o usuário não for encontrado (user = null)", async () => {
    request = {
      params: { id: "user-2" },
    };

    executeMock.mockResolvedValue({ user: null });

    await findUserByid(request, reply);

    expect(executeMock).toHaveBeenCalledWith({ userId: "user-2" });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("deve retornar 404 se o serviço lançar ResourceNotFoundError", async () => {
    request = {
      params: { id: "user-3" },
    };

    executeMock.mockRejectedValue(new ResourceNotFoundError());

    await findUserByid(request, reply);

    expect(executeMock).toHaveBeenCalledWith({ userId: "user-3" });
    expect(statusMock).toHaveBeenCalledWith(404);
    // AQUI: corrigimos para a mensagem real da exceção
    expect(sendMock).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("deve retornar 500 se ocorrer um erro inesperado", async () => {
    request = {
      params: { id: "user-4" },
    };

    executeMock.mockRejectedValue(new Error("Erro inesperado"));

    await findUserByid(request, reply);

    expect(executeMock).toHaveBeenCalledWith({ userId: "user-4" });
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
