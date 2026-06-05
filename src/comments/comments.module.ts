import { Module } from "@nestjs/common"
import { CommentsService } from "@/comments/comments.service"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsModule } from "@/posts/posts.module"
import { PrismaModule } from "@/shared/prisma.module"

@Module({
    imports: [PostsModule, ModerationModule, PrismaModule],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule {}
