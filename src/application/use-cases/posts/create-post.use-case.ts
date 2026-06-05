import { BadRequestException, Injectable } from "@nestjs/common"
import { CreatePostDto } from "@/posts/posts.dtos"
import { ModerationService } from "@/moderation/moderation.service"
import { PrismaService } from "@/shared/prisma.service"

@Injectable()
export class CreatePostUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly moderationService: ModerationService,
    ) {}

    async execute(data: CreatePostDto) {
        const text = `${data.title} ${data.description}`
        const moderation = await this.moderationService.moderate(text)

        if (!moderation.approved) {
            throw new BadRequestException(
                moderation.reason ?? "Post bloqueado por moderación",
            )
        }

        return await this.prisma.post.create({ data })
    }
}
