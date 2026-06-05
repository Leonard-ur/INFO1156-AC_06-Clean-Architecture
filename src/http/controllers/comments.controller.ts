import { Body, Controller, Get, Param, Post } from "@nestjs/common"
import { CreateCommentDto } from "@/http/dtos"
import { CreateCommentUseCase, ListCommentsUseCase } from "@/application/use-cases/comments"

@Controller("api/posts/:id/comments")
export class CommentsController {
    constructor(
        private readonly createCommentUseCase: CreateCommentUseCase,
        private readonly listCommentsUseCase: ListCommentsUseCase,
    ) {}

    @Get()
    async list(@Param("id") postId: string) {
        return await this.listCommentsUseCase.execute(postId)
    }

    @Post()
    async create(@Param("id") postId: string, @Body() body: CreateCommentDto) {
        // Transformar DTO → tipo de aplicación
        return await this.createCommentUseCase.execute(postId, {
            content: body.content,
        })
    }
}
