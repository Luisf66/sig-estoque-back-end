import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { profile } from "./get-user-profile";
import { makeGetUserProfileService } from "../../../services/factories/user/make-get-user-profile-service";
import { makeFindManagerByUserIdService } from "../../../services/factories/manager/make-find-manager-by-user-id-service";
import { ResourceNotFoundError } from "../../../services/errors/resource-not-found-error";

vi.mock("../../../services/factories/user/make-get-user-profile-service");
vi.mock("../../../services/factories/manager/make-find-manager-by-user-id-service");

describe("profile Controller", () => {
  let request: any;
  let reply: any;
  let statusMock: any;
  let sendMock: any;
  let executeUserProfileMock: any;
  let executeFindManagerMock: any;
  let jwtVerifyMock: any;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    sendMock = vi.fn();

    reply = {
      status: statusMock,
      send: sendMock,
    };

    jwtVerifyMock = vi.fn();

    request = {
      jwtVerify: jwtVerifyMock,
      user: {
        sub: "user-123",
      },
    };

    executeUserProfileMock = vi.fn();
    (makeGetUserProfileService as any).mockReturnValue({
      execute: executeUserProfileMock,
    });

    executeFindManagerMock = vi.fn();
    (makeFindManagerByUserIdService as any).mockReturnValue({
      execute: executeFindManagerMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 200 e os dados do usuário + manager quando o usuário for MANAGER", async () => {
    const fakeUser = { id: "user-123", name: "John Doe", role: "MANAGER" };
    const fakeManager = { id: "manager-1", userId: "user-123", name: "Gerente" };

    executeUserProfileMock.mockResolvedValue({ user: fakeUser });
    executeFindManagerMock.mockResolvedValue(fakeManager);

    await profile(request, reply);

    expect(jwtVerifyMock).toHaveBeenCalledOnce();
    expect(executeUserProfileMock).toHaveBeenCalledWith({ userId: "user-123" });
    expect(executeFindManagerMock).toHaveBeenCalledWith({ userId: "user-123" });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      user: fakeUser,
      switchedUser: fakeManager,
    });
  });

  it("deve retornar 404 se o role do usuário for inválido", async () => {
    const fakeUser = { id: "user-456", name: "Jane Doe", role: "UNKNOWN" };
    executeUserProfileMock.mockResolvedValue({ user: fakeUser });

    await profile(request, reply);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("deve retornar 404 se o serviço getUserProfile lançar ResourceNotFoundError", async () => {
    executeUserProfileMock.mockRejectedValue(new ResourceNotFoundError());

    await profile(request, reply);

    expect(executeUserProfileMock).toHaveBeenCalledWith({ userId: "user-123" });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("deve retornar 500 se ocorrer um erro inesperado", async () => {
    executeUserProfileMock.mockRejectedValue(new Error("Erro inesperado"));

    await profile(request, reply);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
