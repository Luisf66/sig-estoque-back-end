import { describe, it, expect, beforeEach, vi } from "vitest";
import { FindManagerByIdService } from "./find-manager-by-id";
import { ManagerRepository } from "../../repositories/manager-repository";
import { NoRecordsFoundError } from "../errors/no-records-found-error";

describe("FindManagerByIdService", () => {
  let mockManagerRepository: ManagerRepository;
  let findManagerByIdService: FindManagerByIdService;

  beforeEach(() => {
    mockManagerRepository = {
      findById: vi.fn(),
    } as unknown as ManagerRepository;

    findManagerByIdService = new FindManagerByIdService(mockManagerRepository);
  });

  it("deve retornar o gerente ao buscar por ID existente", async () => {
    const mockManager = {
      id: "manager-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockManagerRepository, "findById").mockResolvedValue(mockManager);

    const response = await findManagerByIdService.execute({ id: "manager-1" });

    expect(mockManagerRepository.findById).toHaveBeenCalledWith("manager-1");
    expect(response.manager).toEqual(mockManager);
  });

  it("deve lançar NoRecordsFoundError quando o gerente não for encontrado", async () => {
    vi.spyOn(mockManagerRepository, "findById").mockResolvedValue(null);

    await expect(findManagerByIdService.execute({ id: "invalid-id" })).rejects.toThrow(NoRecordsFoundError);

    expect(mockManagerRepository.findById).toHaveBeenCalledWith("invalid-id");
  });
});
