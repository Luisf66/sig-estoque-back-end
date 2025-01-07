import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserProfileService } from "./get-user-profile";
import { UserRepository } from "../../repositories/user-repository";
import { User } from "@prisma/client";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("GetUserProfileService", () => {
  let userRepository: UserRepository;
  let getUserProfileService: GetUserProfileService;

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
    } as unknown as UserRepository;

    getUserProfileService = new GetUserProfileService(userRepository);
  });

  it("deve retornar o perfil do usuário se ele for encontrado", async () => {
    const mockUser: User = {
      id: "user-1",
      name: "Maria Silva",
      email: "maria@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userRepository, "findById").mockResolvedValue(mockUser);

    const response = await getUserProfileService.execute({ userId: "user-1" });

    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    expect(userRepository.findById).toHaveBeenCalledTimes(1);
    expect(response.user).toEqual(mockUser);
  });

  it("deve lançar um erro se o perfil do usuário não for encontrado", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(null);

    await expect(getUserProfileService.execute({ userId: "user-2" })).rejects.toThrow(ResourceNotFoundError);

    expect(userRepository.findById).toHaveBeenCalledWith("user-2");
    expect(userRepository.findById).toHaveBeenCalledTimes(1);
  });
});
