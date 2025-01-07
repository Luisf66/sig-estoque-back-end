import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserAuthenticateService } from "./user-authenticate";
import { UserRepository } from "../../repositories/user-repository";
import { InvalidCredentialError } from "../errors/invalid-credential-error";
import * as bcrypt from "bcryptjs";
import { User } from "@prisma/client";

vi.mock("bcryptjs", () => ({
  compare: vi.fn(), // Garante que `compare` é mockado corretamente.
}));

describe("UserAuthenticateService", () => {
  let userRepository: UserRepository;
  let userAuthenticateService: UserAuthenticateService;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
    } as unknown as UserRepository;

    userAuthenticateService = new UserAuthenticateService(userRepository);
  });

  it("deve autenticar o usuário com credenciais válidas", async () => {
    const mockUser: User = {
      id: "user-1",
      name: "João Silva",
      email: "joao@example.com",
      password_hash: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(mockUser);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true); // Usa o namespace `bcrypt`.

    const response = await userAuthenticateService.execute({
      email: "joao@example.com",
      password: "password",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith("joao@example.com");
    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedpassword");
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(response.user).toEqual(mockUser);
  });

  it("deve lançar um erro se o e-mail não for encontrado", async () => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(null);

    await expect(
      userAuthenticateService.execute({
        email: "joao@example.com",
        password: "password",
      })
    ).rejects.toThrow(InvalidCredentialError);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("joao@example.com");
    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
  });

  it("deve lançar um erro se a senha estiver incorreta", async () => {
    const mockUser: User = {
      id: "user-1",
      name: "João Silva",
      email: "joao@example.com",
      password_hash: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(mockUser);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(false); // Usa o namespace `bcrypt`.

    await expect(
      userAuthenticateService.execute({
        email: "joao@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow(InvalidCredentialError);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("joao@example.com");
    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "hashedpassword");
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
  });
});
