import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllSaleByUserIdService } from "./fetch-all-sale-by-user-id";
import { InMemorySaleRepository } from "../../repositories/in-memory/in-memory-sale-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository";
import { Sale } from "@prisma/client";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

let saleRepository: InMemorySaleRepository;
let userRepository: InMemoryUsersRepository;
let fetchAllSaleByUserIdService: FetchAllSaleByUserIdService;

describe("FetchAllSaleByUserIdService", () => {
    beforeEach(() => {
        saleRepository = new InMemorySaleRepository();
        userRepository = new InMemoryUsersRepository();
        fetchAllSaleByUserIdService = new FetchAllSaleByUserIdService(saleRepository, userRepository);
    });

    it("deve buscar todas as vendas de um usuário existente", async () => {
        // Criando um usuário para o teste
        const user = await userRepository.create({
            name: "Test User",
            email: "test@example.com",
            password_hash: "hashed_password_123",
            role: "EMPLOYEE",
        });

        // Criando vendas para o usuário
        const sale1 = await saleRepository.create({
            nf_number: "12345",
            user: {
                connect: {
                    id: user.id,
                },
            },
        });

        const sale2 = await saleRepository.create({
            nf_number: "67890",
            user: {
                connect: {
                    id: user.id,
                },
            },
        });


        // Executando o serviço
        const response = await fetchAllSaleByUserIdService.execute({ userId: user.id });

        // Verificando se as vendas foram retornadas corretamente
        expect(response.sales).toHaveLength(2);
        expect(response.sales).toEqual([sale1, sale2]);
    });

    it("deve lançar um erro se o usuário não for encontrado", async () => {
        // Executando o serviço com um ID de usuário não existente
        await expect(fetchAllSaleByUserIdService.execute({ userId: "non-existing-user-id" }))
            .rejects
            .toBeInstanceOf(ResourceNotFoundError);
    });
});
