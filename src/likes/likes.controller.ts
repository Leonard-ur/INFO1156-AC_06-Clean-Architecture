import { Body, Controller, Param, Post } from "@nestjs/common"
import { LikesService } from "@/likes/likes.service"
import { AddLikeDto } from "@/http/dtos"

@Controller("api/posts/:id/likes")
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Post()
    create(@Param("id") postId: string, @Body() body: AddLikeDto) {
        return this.likesService.create(postId, body)
    }
}
