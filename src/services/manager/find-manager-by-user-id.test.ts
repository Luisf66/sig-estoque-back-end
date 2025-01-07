import { describe, it, expect, beforeEach, vi } from "vitest";
import { FindManagerByUserId } from "./find-manager-by-user-id";
import { ManagerRepository } from "../../repositories/manager-repository";

describe("FindManagerByUserId", () => {
  let mockManagerRepository: ManagerRepository;
  let findManagerByUserIdService: FindManagerByUserId;

  beforeEach(() => {
    mockManagerRepository = {
      findByUserId: vi.fn(),
    } as unknown as ManagerRepository;

    findManagerByUserIdService = new FindManagerByUserId(mockManagerRepository);
  });

  it("deve retornar o gerente ao buscar pelo userId existente", async () => {
    const mockManager = {
      id: "manager-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockManagerRepository, "findByUserId").mockResolvedValue(mockManager);

    const response = await findManagerByUserIdService.execute({ userId: "user-1" });

    expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(response.manager).toEqual(mockManager);
  });

  it("deve retornar null ao buscar por um userId inexistente", async () => {
    vi.spyOn(mockManagerRepository, "findByUserId").mockResolvedValue(null);

    const response = await findManagerByUserIdService.execute({ userId: "invalid-user" });

    expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("invalid-user");
    expect(response.manager).toBeNull();
  });
});
