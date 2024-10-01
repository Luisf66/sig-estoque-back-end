import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryPurchaseRepository } from '../../repositories/in-memory/in-memory-purchase-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { FetchAllPurchaseByUserIdService } from './fetch-all-purchase-by-user-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let purchaseRepository: InMemoryPurchaseRepository;
let userRepository: InMemoryUsersRepository;
let fetchAllPurchaseByUserIdService: FetchAllPurchaseByUserIdService;

describe('FetchAllPurchaseByUserIdService', () => {
    beforeEach(() => {
        purchaseRepository = new InMemoryPurchaseRepository();
        userRepository = new InMemoryUsersRepository();
        fetchAllPurchaseByUserIdService = new FetchAllPurchaseByUserIdService(
            purchaseRepository,
            userRepository
        );
    });

    it('should fetch all purchases by user id', async () => {
        const user = await userRepository.create({
            name: 'Test User',
            email: 'test@example.com',
            role: 'EMPLOYEE',
            password_hash: 'hashed-password', // Adiciona a propriedade password_hash
        });

        // Criação das compras usando o formato correto
        await purchaseRepository.create({
            nf_number: '12345',
            subTotal: 100,
            user: { connect: { id: user.id } },
            supplier: { connect: { id: 'some-supplier-id' } }, // Use um ID de fornecedor válido
        });

        await purchaseRepository.create({
            nf_number: '67890',
            subTotal: 200,
            user: { connect: { id: user.id } },
            supplier: { connect: { id: 'some-supplier-id' } }, // Use um ID de fornecedor válido
        });

        const response = await fetchAllPurchaseByUserIdService.execute({
            userId: user.id,
        });

        expect(response.purchases).toHaveLength(2);
        expect(response.purchases[0].userId).toBe(user.id);
        expect(response.purchases[1].userId).toBe(user.id);
    });

    it('should throw ResourceNotFoundError if user does not exist', async () => {
        await expect(
            fetchAllPurchaseByUserIdService.execute({ userId: 'non-existent-id' })
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });
});
