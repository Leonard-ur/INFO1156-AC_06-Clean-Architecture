import { Controller, Get } from "@nestjs/common"
import { CategoriesService } from "@/categories/categories.service"

@Controller("api/categories")
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    findAll() {
        return this.categoriesService.findAll()
    }
}
