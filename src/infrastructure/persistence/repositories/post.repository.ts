import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"

import { IPostRepository } from "@/domain/repositories"
import { Post } from "@/domain/entities/post.entity"
import { PostMapper } from "@/infrastructure/persistence/mappers/post.mapper"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class PrismaPostRepository implements IPostRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(options?: { categoryId?: string }): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            where: options?.categoryId ? { categoryId: options.categoryId } : undefined,
            include: { category: true },
            orderBy: { createdAt: "desc" },
        })

        return posts.map((post) => PostMapper.toDomain(post))
    }

    async findById(id: string): Promise<Post | null> {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { category: true },
        })

        return post ? PostMapper.toDomain(post) : null
    }

    async create(
        data: Pick<Post, "title" | "content" | "categoryId" | "imageUrl">,
    ): Promise<Post> {
        // Manejo seguro del categoryId
        const categoryId = data.categoryId ? data.categoryId.trim() : ""
        
        const created = await this.prisma.post.create({
            data: {
                title: data.title,
                description: data.content,
                imageUrl: data.imageUrl ?? "",
                categoryId: categoryId.length > 0 ? categoryId : null,
            },
            include: { category: true },
        })

        return PostMapper.toDomain(created)
    }

    async update(
        id: string,
        data: Partial<Pick<Post, "title" | "content" | "imageUrl">>,
    ): Promise<Post> {
        const updateData: Prisma.PostUncheckedUpdateInput = {}

        if (data.title !== undefined) {
            updateData.title = data.title
        }

        if (data.content !== undefined) {
            updateData.description = data.content
        }

        if (data.imageUrl !== undefined) {
            updateData.imageUrl = data.imageUrl ?? ""
        }

        const updated = await this.prisma.post.update({
            where: { id },
            data: updateData,
            include: { category: true },
        })

        return PostMapper.toDomain(updated)
    }

    async delete(id: string): Promise<void> {
        await this.prisma.post.delete({
            where: { id },
        })
    }
}