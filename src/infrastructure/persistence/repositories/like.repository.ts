import { Injectable } from "@nestjs/common"

import { ILikeRepository } from "@/domain/repositories"
import { Like } from "@/domain/entities/like.entity"
import { ReactionType } from "@/domain/value-objects/reaction-type.vo"
import { LikeMapper } from "@/infrastructure/persistence/mappers/like.mapper"
import { PrismaService } from "@/shared/prisma.service"

const LIKE_SOURCE = "app"

@Injectable()
export class PrismaLikeRepository implements ILikeRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByPostId(postId: string): Promise<Like[]> {
        const likes = await this.prisma.like.findMany({
            where: { postId },
            orderBy: { createdAt: "asc" },
        })

        return likes.map((like) => LikeMapper.toDomain(like))
    }

    async create(data: Pick<Like, "postId" | "reactionType">): Promise<Like> {
        const like = await this.prisma.like.create({
            data: {
                postId: data.postId,
                reactionType: data.reactionType,
                weight: 1,
                source: LIKE_SOURCE,
            },
        })

        return LikeMapper.toDomain(like)
    }

    async countByPostId(postId: string): Promise<number> {
        const aggregated = await this.prisma.like.aggregate({
            where: { postId },
            _sum: { weight: true },
        })

        return aggregated._sum.weight ?? 0
    }

    async getReactionSummary(
        postId: string,
    ): Promise<Record<ReactionType, number>> {
        const summary = this.createEmptyReactionSummary()

        const grouped = await this.prisma.like.groupBy({
            by: ["reactionType"],
            where: { postId },
            _count: { _all: true },
        })

        for (const row of grouped) {
            if (this.isReactionType(row.reactionType)) {
                summary[row.reactionType] = row._count._all
            }
        }

        return summary
    }

    private createEmptyReactionSummary(): Record<ReactionType, number> {
        return {
            [ReactionType.LIKE]: 0,
            [ReactionType.LOVE]: 0,
            [ReactionType.HAHA]: 0,
            [ReactionType.WOW]: 0,
            [ReactionType.SAD]: 0,
            [ReactionType.ANGRY]: 0,
        }
    }

    private isReactionType(value: string): value is ReactionType {
        return Object.values(ReactionType).includes(value as ReactionType)
    }
}
