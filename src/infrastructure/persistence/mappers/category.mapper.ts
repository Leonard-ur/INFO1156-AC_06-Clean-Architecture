import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '@/domain/entities/category.entity';

export class CategoryMapper {
  static toDomain(prismaCategory: PrismaCategory): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      new Date() // Fallback seguro ya que Prisma schema no tiene createdAt en Category
    );
  }
}