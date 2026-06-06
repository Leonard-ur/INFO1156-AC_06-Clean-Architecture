import { Injectable } from "@nestjs/common"

import { Comment } from "@/domain/entities/comment.entity"
import { ICommentRepository } from "@/domain/repositories"
import { CommentMapper } from "@/infrastructure/persistence/mappers/comment.mapper"
import { PrismaService } from "@/shared/prisma.service"

const COMMENT_SOURCE = "app"

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByPostId(postId: string): Promise<Comment[]> {
        const comments = await this.prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "asc" },
        })

        return comments.map((comment) => CommentMapper.toDomain(comment))
    }

    async create(data: Pick<Comment, "content" | "postId">): Promise<Comment> {
        const comment = await this.prisma.comment.create({
            data: {
                content: data.content,
                postId: data.postId,
                source: COMMENT_SOURCE,
            },
        })

        return CommentMapper.toDomain(comment)
    }

    async delete(id: string): Promise<void> {
        await this.prisma.comment.delete({
            where: { id },
        })
    }
}
