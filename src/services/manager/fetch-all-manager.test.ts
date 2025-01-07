import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchAllManagerService } from "./fetch-all-manager";
import { ManagerRepository } from "../../repositories/manager-repository";

describe("FetchAllManagerService", () => {
  let mockManagerRepository: ManagerRepository;
  let fetchAllManagerService: FetchAllManagerService;

  beforeEach(() => {
    mockManagerRepository = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "manager-1",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "manager-2",
          userId: "user-2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    } as unknown as ManagerRepository;

    fetchAllManagerService = new FetchAllManagerService(mockManagerRepository);
  });

  it("deve retornar todos os gerentes com sucesso", async () => {
    const response = await fetchAllManagerService.execute();

    expect(mockManagerRepository.findMany).toHaveBeenCalled();
    expect(response.managers).toEqual([
      {
        id: "manager-1",
        userId: "user-1",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      {
        id: "manager-2",
        userId: "user-2",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
  });
});
