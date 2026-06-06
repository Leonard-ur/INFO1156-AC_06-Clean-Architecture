import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { CreateCommentInput } from "@/application/types"
import {
    COMMENT_REPOSITORY,
    ICommentRepository,
    POST_REPOSITORY,
    IPostRepository,
} from "@/domain/repositories"
import { IModerationService, MODERATION_SERVICE } from "@/domain/services/moderation.service.interface"

/**
 * CreateCommentUseCase
 *
 * Crea un comentario en un post existente, aplicando moderación de contenido.
 *
 * CAMBIO vs versión original:
 *   Antes inyectaba PrismaService y ModerationService (que también usa Prisma).
 *   Ahora inyecta:
 *     - IPostRepository → para verificar que el post existe
 *     - ICommentRepository → para persistir el comentario
 *     - IModerationService → interfaz del dominio para moderar contenido
 *
 * El use case no sabe nada de Prisma: solo trabaja con contratos del dominio.
 */
@Injectable()
export class CreateCommentUseCase {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: IPostRepository,

        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,

        @Inject(MODERATION_SERVICE)
        private readonly moderationService: IModerationService,
    ) {}

    async execute(postId: string, data: CreateCommentInput): Promise<unknown> {
        const post = await this.postRepository.findById(postId)
        if (!post) {
            throw new NotFoundException(`Post con id ${postId} no encontrado`)
        }

        const moderation = await this.moderationService.moderate(data.content)
        if (!moderation.approved) {
            throw new BadRequestException(
                moderation.reason ?? "Comentario bloqueado por moderación",
            )
        }

        return this.commentRepository.create({
            content: data.content,
            postId,
        })
    }
}
