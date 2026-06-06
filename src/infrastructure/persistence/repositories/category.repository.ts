import { Injectable } from "@nestjs/common"

import { Category } from "@/domain/entities/category.entity"
import { ICategoryRepository } from "@/domain/repositories"
import { CategoryMapper } from "@/infrastructure/persistence/mappers/category.mapper"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            orderBy: { name: "asc" },
        })

        return categories.map((category) => CategoryMapper.toDomain(category))
    }

    async findById(id: string): Promise<Category | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        })

        return category ? CategoryMapper.toDomain(category) : null
    }

    async create(data: Pick<Category, "name">): Promise<Category> {
        const name = data.name.trim()
        const category = await this.prisma.category.create({
            data: {
                name,
                slug: this.slugify(name),
            },
        })

        return CategoryMapper.toDomain(category)
    }

    private slugify(value: string): string {
        const slug = value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")

        return slug.length > 0 ? slug : "category"
    }
}
