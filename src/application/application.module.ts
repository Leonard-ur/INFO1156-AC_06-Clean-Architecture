import { Module } from "@nestjs/common"
import { CreatePostUseCase, GetAllPostsUseCase, GetFeedPostsUseCase } from "@/application/use-cases/posts"
import { CreateCommentUseCase, ListCommentsUseCase } from "@/application/use-cases/comments"
import { PrismaModule } from "@/shared/prisma.module"
import { ModerationModule } from "@/moderation/moderation.module"

@Module({
    imports: [PrismaModule, ModerationModule],
    providers: [
        CreatePostUseCase,
        GetAllPostsUseCase,
        GetFeedPostsUseCase,
        CreateCommentUseCase,
        ListCommentsUseCase,
    ],
    exports: [
        CreatePostUseCase,
        GetAllPostsUseCase,
        GetFeedPostsUseCase,
        CreateCommentUseCase,
        ListCommentsUseCase,
    ],
})
export class ApplicationModule {}
