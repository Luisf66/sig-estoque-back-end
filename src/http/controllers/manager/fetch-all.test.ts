import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { fetchAllManagers } from "./fetch-all";
import { makeFetchAllManagersService } from "../../../services/factories/manager/make-fetch-all-managers-serive";

vi.mock("../../../services/factories/manager/make-fetch-all-managers-serive");

describe("fetchAllManagers controller", () => {
  it("deve retornar todos os gerentes com sucesso", async () => {
    const mockRequest = {} as FastifyRequest;
    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),    
    } as unknown as FastifyReply;

    const mockManagers = [
      { id: "1", name: "Manager 1", email: "m1@example.com" },
      { id: "2", name: "Manager 2", email: "m2@example.com" },
    ];

    const mockService = {
      execute: vi.fn().mockResolvedValue({ managers: mockManagers }),
    };

    (makeFetchAllManagersService as unknown as vi.Mock).mockReturnValue(mockService);

    await fetchAllManagers(mockRequest, mockReply);

    expect(mockService.execute).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ managers: mockManagers });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    const mockRequest = {} as FastifyRequest;
    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const mockService = {
      execute: vi.fn().mockRejectedValue(new Error("DB error")),
    };

    (makeFetchAllManagersService as unknown as vi.Mock).mockReturnValue(mockService);

    await fetchAllManagers(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
