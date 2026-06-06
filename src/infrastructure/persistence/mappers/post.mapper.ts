import { 
  Post as PrismaPost, 
  Category as PrismaCategory, 
  Comment as PrismaComment, 
  Like as PrismaLike 
} from '@prisma/client';
import { Post } from '@/domain/entities/post.entity';
import { CategoryMapper } from './category.mapper';
import { CommentMapper } from './comment.mapper';
import { LikeMapper } from './like.mapper';

export type PrismaPostWithRelations = PrismaPost & {
  category?: PrismaCategory | null;
  comments?: PrismaComment[];
  likes?: PrismaLike[];
};

export class PostMapper {
  static toDomain(prismaPost: PrismaPostWithRelations): Post {
    return new Post(
      prismaPost.id,
      prismaPost.title,
      prismaPost.description, // Prisma 'description' -> Domain 'content'
      prismaPost.imageUrl,
      prismaPost.categoryId ?? '', // CORRECCIÓN: string estricto, nunca null
      prismaPost.createdAt,
      prismaPost.updatedAt,
      prismaPost.category ? CategoryMapper.toDomain(prismaPost.category) : undefined,
      prismaPost.comments ? prismaPost.comments.map(CommentMapper.toDomain) : undefined,
      prismaPost.likes ? prismaPost.likes.map(LikeMapper.toDomain) : undefined
    );
  }
}