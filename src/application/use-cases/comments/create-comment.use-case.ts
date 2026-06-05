import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { CreateCommentDto } from "@/posts/posts.dtos"
import { ModerationService } from "@/moderation/moderation.service"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class CreateCommentUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly moderationService: ModerationService,
    ) {}

    async execute(postId: string, data: CreateCommentDto) {
        await this.assertPostExists(postId)

        const moderation = await this.moderationService.moderate(data.content)
        if (!moderation.approved) {
            throw new BadRequestException(
                moderation.reason ?? "Comentario bloqueado por moderación",
            )
        }

        return this.prisma.comment.create({
            data: {
                postId,
                content: data.content,
                source: "comments-module",
            },
        })
    }

    private async assertPostExists(postId: string): Promise<void> {
        const post = await this.prisma.post.findUnique({ where: { id: postId } })

        if (!post) {
            throw new NotFoundException(`Post con id ${postId} no encontrado`)
        }
    }
}
