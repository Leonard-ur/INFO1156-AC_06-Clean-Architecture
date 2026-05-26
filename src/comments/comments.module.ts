import { Module } from "@nestjs/common"
import { CommentsController } from "@/comments/comments.controller"
import { CommentsService } from "@/comments/comments.service"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsModule } from "@/posts/posts.module"

@Module({
    imports: [PostsModule, ModerationModule],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
