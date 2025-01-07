import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllUsersService } from "./get-all-users";
import { UserRepository } from "../../repositories/user-repository";
import { User } from "@prisma/client";

describe("GetAllUsersService", () => {
  let userRepository: UserRepository;
  let getAllUsersService: GetAllUsersService;

  beforeEach(() => {
    userRepository = {
      findMany: vi.fn(),
    } as unknown as UserRepository;

    getAllUsersService = new GetAllUsersService(userRepository);
  });

  it("deve retornar todos os usuários", async () => {
    const mockUsers: User[] = [
      {
        id: "user-1",
        name: "João Silva",
        email: "joao@example.com",
        password: "hashedpassword1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-2",
        name: "Maria Oliveira",
        email: "maria@example.com",
        password: "hashedpassword2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(userRepository, "findMany").mockResolvedValue(mockUsers);

    const response = await getAllUsersService.execute();

    expect(userRepository.findMany).toHaveBeenCalledTimes(1);
    expect(response.users).toEqual(mockUsers);
  });

  it("deve retornar uma lista vazia quando não houver usuários", async () => {
    vi.spyOn(userRepository, "findMany").mockResolvedValue([]);

    const response = await getAllUsersService.execute();

    expect(userRepository.findMany).toHaveBeenCalledTimes(1);
    expect(response.users).toEqual([]);
  });
});
