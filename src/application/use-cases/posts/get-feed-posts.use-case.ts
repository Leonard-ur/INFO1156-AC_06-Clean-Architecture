import { Injectable } from "@nestjs/common"
import { GetFeedPostsInput } from "@/application/types"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class GetFeedPostsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(input: GetFeedPostsInput) {
        const posts = await this.prisma.post.findMany({
            where: input.categoryId ? { categoryId: input.categoryId } : undefined,
            include: { comments: true, likes: true, category: true },
        })

        return posts.map((post) => ({
            id: post.id,
            title: post.title,
            description: post.description,
            imageUrl: post.imageUrl,
            categoryId: post.categoryId,
            category: post.category?.name ?? null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likesCount: post.likes.reduce((sum, l) => sum + l.weight, 0),
            commentsCount: post.comments.length,
            relevanceScore: 0,
        }))
    }
}
