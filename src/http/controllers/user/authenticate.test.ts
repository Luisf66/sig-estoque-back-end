import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { authenticateUser } from "./authenticate";
import { makeUserAuthenticateService } from "../../../services/factories/user/make-user-authenticate-service";
import { InvalidCredentialError } from "../../../services/errors/invalid-credential-error";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/user/make-user-authenticate-service");

describe("authenticateUser Controller", () => {
  let mockAuthenticateUserService: { execute: vi.Mock };

  beforeEach(() => {
    mockAuthenticateUserService = {
      execute: vi.fn(),
    };

    vi.mocked(makeUserAuthenticateService).mockReturnValue(mockAuthenticateUserService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve autenticar o usuário e retornar o token com status 200", async () => {
    mockAuthenticateUserService.execute.mockResolvedValue({
      user: {
        id: "user-1",
        role: "admin",
      },
    });

    const request = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    } as unknown as FastifyRequest;

    const reply = {
      jwtSign: vi.fn().mockResolvedValue("mocked-jwt-token"), // Mock do método jwtSign
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await authenticateUser(request, reply);

    expect(mockAuthenticateUserService.execute).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    expect(reply.jwtSign).toHaveBeenCalledWith(
      { role: "admin" },
      { sign: { sub: "user-1" } }
    );

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      id: "user-1",
      role: "admin",
      token: "mocked-jwt-token",
    });
  });

  it("deve retornar erro 400 para credenciais inválidas", async () => {
    mockAuthenticateUserService.execute.mockRejectedValue(
      new InvalidCredentialError()
    );

    const request = {
      body: {
        email: "invalid@example.com",
        password: "wrongpassword",
      },
    } as unknown as FastifyRequest;

    const reply = {
      jwtSign: vi.fn(), // Mock necessário, mas não usado nesse caso
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await authenticateUser(request, reply);

    expect(mockAuthenticateUserService.execute).toHaveBeenCalledWith({
      email: "invalid@example.com",
      password: "wrongpassword",
    });

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Invalid credentials." });
  });

  it("deve lançar um erro inesperado", async () => {
    mockAuthenticateUserService.execute.mockRejectedValue(new Error("Unexpected error"));

    const request = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as unknown as FastifyRequest;
  
      const reply = {
        jwtSign: vi.fn(), // Mock necessário, mas não usado nesse caso
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as FastifyReply;
  
      await expect(authenticateUser(request, reply)).rejects.toThrowError("Unexpected error");
  
      expect(mockAuthenticateUserService.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });