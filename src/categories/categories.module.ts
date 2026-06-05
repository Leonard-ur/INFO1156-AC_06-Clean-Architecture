import { Module } from "@nestjs/common"
import { CategoriesController } from "@/categories/categories.controller"
import { CategoriesService } from "@/categories/categories.service"
import { PrismaModule } from "@/shared/prisma.module"

@Module({
    imports: [PrismaModule],
    controllers: [CategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}
