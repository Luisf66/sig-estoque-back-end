import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { profile } from "./get-user-profile";
import { makeGetUserProfileService } from "../../../services/factories/user/make-get-user-profile-service";
import { makeFindManagerByUserIdService } from "../../../services/factories/manager/make-find-manager-by-user-id-service";
import { ResourceNotFoundError } from "../../../services/errors/resource-not-found-error";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/user/make-get-user-profile-service");
vi.mock("../../../services/factories/manager/make-find-manager-by-user-id-service");

describe("profile Controller", () => {
  let mockGetUserProfileService: { execute: vi.Mock };
  let mockFindManagerByUserIdService: { execute: vi.Mock };

  beforeEach(() => {
    mockGetUserProfileService = {
      execute: vi.fn(),
    };

    mockFindManagerByUserIdService = {
      execute: vi.fn(),
    };

    vi.mocked(makeGetUserProfileService).mockReturnValue(mockGetUserProfileService);
    vi.mocked(makeFindManagerByUserIdService).mockReturnValue(mockFindManagerByUserIdService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar o perfil do usuário e informações do gerente quando o usuário for um gerente", async () => {
    mockGetUserProfileService.execute.mockResolvedValueOnce({
      user: { id: "user-1", role: "MANAGER" },
    });

    mockFindManagerByUserIdService.execute.mockResolvedValueOnce({
      id: "manager-1",
      name: "John Doe",
    });

    const request = {
      jwtVerify: vi.fn().mockResolvedValueOnce(undefined),
      user: { sub: "user-1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await profile(request, reply);

    expect(mockGetUserProfileService.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(mockFindManagerByUserIdService.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      user: { id: "user-1", role: "MANAGER" },
      switchedUser: { id: "manager-1", name: "John Doe" },
    });
  });

  it("deve retornar erro 404 quando o usuário não for encontrado", async () => {
    mockGetUserProfileService.execute.mockRejectedValueOnce(new ResourceNotFoundError());

    const request = {
      jwtVerify: vi.fn().mockResolvedValueOnce(undefined),
      user: { sub: "non-existent-user" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await profile(request, reply);

    expect(mockGetUserProfileService.execute).toHaveBeenCalledWith({ userId: "non-existent-user" });
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("deve retornar erro 404 para cenários não tratados", async () => {
    mockGetUserProfileService.execute.mockResolvedValueOnce({
      user: { id: "user-1", role: "UNEXPECTED_ROLE" }, // Role inesperada
    });
  
    const request = {
      jwtVerify: vi.fn().mockResolvedValueOnce(undefined),
      user: { sub: "user-1" },
    } as unknown as FastifyRequest;
  
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    await profile(request, reply);
  
    expect(mockGetUserProfileService.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Resource not found" });
  });
  

  it("deve retornar erro 500 para erros inesperados", async () => {
    mockGetUserProfileService.execute.mockRejectedValueOnce(new Error("Unexpected error"));

    const request = {
      jwtVerify: vi.fn().mockResolvedValueOnce(undefined),
      user: { sub: "user-1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await profile(request, reply);

    expect(mockGetUserProfileService.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
