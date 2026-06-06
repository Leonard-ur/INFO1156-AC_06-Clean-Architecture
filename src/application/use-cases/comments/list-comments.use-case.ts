import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import {
    COMMENT_REPOSITORY,
    ICommentRepository,
    POST_REPOSITORY,
    IPostRepository,
} from "@/domain/repositories"

export interface ListCommentsOutput {
    total_comments: number
    comments: unknown[]
}

/**
 * ListCommentsUseCase
 *
 * Lista todos los comentarios de un post, verificando que el post exista.
 *
 * CAMBIO vs versión original:
 *   Antes: dos llamadas directas a this.prisma (post.findUnique + comment.findMany).
 *   Ahora: dos repositorios del dominio → IPostRepository + ICommentRepository.
 *
 * La misma lógica de negocio (verificar post, ordenar por fecha) se mantiene,
 * pero desacoplada de cualquier ORM.
 */
@Injectable()
export class ListCommentsUseCase {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: IPostRepository,

        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
    ) {}

    async execute(postId: string): Promise<ListCommentsOutput> {
        const post = await this.postRepository.findById(postId)
        if (!post) {
            throw new NotFoundException(`Post con id ${postId} no encontrado`)
        }

        const comments = await this.commentRepository.findByPostId(postId)

        return {
            total_comments: comments.length,
            comments,
        }
    }
}
