import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class ListCommentsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(postId: string) {
        await this.assertPostExists(postId)

        const comments = await this.prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "desc" },
        })

        return {
            total_comments: comments.length,
            comments,
        }
    }

    private async assertPostExists(postId: string): Promise<void> {
        const post = await this.prisma.post.findUnique({ where: { id: postId } })

        if (!post) {
            throw new NotFoundException(`Post con id ${postId} no encontrado`)
        }
    }
}
