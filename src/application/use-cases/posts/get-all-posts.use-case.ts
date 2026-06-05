import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class GetAllPostsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute() {
        return await this.prisma.post.findMany({
            orderBy: { createdAt: "desc" },
        })
    }
}
