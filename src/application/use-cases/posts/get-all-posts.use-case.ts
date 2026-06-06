import { Inject, Injectable } from "@nestjs/common"
import { POST_REPOSITORY, IPostRepository } from "@/domain/repositories"

/**
 * GetAllPostsUseCase
 *
 * Retorna todos los posts ordenados por fecha de creación descendente.
 *
 * CAMBIO vs versión original:
 *   Antes: this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
 *   Ahora: this.postRepository.findAll()
 *   El ordenamiento por defecto es responsabilidad de la implementación
 *   del repositorio (PrismaPostRepository), no del use case.
 */
@Injectable()
export class GetAllPostsUseCase {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: IPostRepository,
    ) {}

    async execute(): Promise<unknown> {
        return this.postRepository.findAll()
    }
}
