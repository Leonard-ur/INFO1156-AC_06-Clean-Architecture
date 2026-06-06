import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { CreatePostInput } from "@/application/types"
import { POST_REPOSITORY, IPostRepository } from "@/domain/repositories"
import { IModerationService, MODERATION_SERVICE } from "@/domain/services/moderation.service.interface"

/**
 * CreatePostUseCase
 *
 * Crea una nueva publicación aplicando moderación de contenido.
 *
 * CAMBIO vs versión original:
 *   Antes inyectaba PrismaService directamente → acoplamiento a infraestructura.
 *   Ahora inyecta IPostRepository (interfaz del dominio) usando el token
 *   POST_REPOSITORY. El use case no sabe ni le importa si hay Prisma, SQLite
 *   o cualquier otro ORM detrás.
 *
 * PRINCIPIO aplicado: Dependency Inversion Principle (DIP)
 *   El negocio (use case) depende de la abstracción (IPostRepository),
 *   no de la implementación concreta (PrismaService).
 */
@Injectable()
export class CreatePostUseCase {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: IPostRepository,

        @Inject(MODERATION_SERVICE)
        private readonly moderationService: IModerationService,
    ) {}

    async execute(data: CreatePostInput): Promise<unknown> {
        const text = `${data.title} ${data.description}`
        const moderation = await this.moderationService.moderate(text)

        if (!moderation.approved) {
            throw new BadRequestException(
                moderation.reason ?? "Post bloqueado por moderación",
            )
        }

        return this.postRepository.create({
            title: data.title,
            content: data.description,
            imageUrl: data.imageUrl ?? null,
            categoryId: data.categoryId ?? "",
        })
    }
}
