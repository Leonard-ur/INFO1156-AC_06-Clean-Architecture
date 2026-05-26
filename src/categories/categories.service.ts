import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.category.findMany({ orderBy: { name: "asc" } })
    }
}
