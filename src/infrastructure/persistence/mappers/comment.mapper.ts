import { Comment as PrismaComment } from '@prisma/client';
import { Comment } from '@/domain/entities/comment.entity';

export class CommentMapper {
  static toDomain(prismaComment: PrismaComment): Comment {
    return new Comment(
      prismaComment.id,
      prismaComment.content,
      prismaComment.postId,
      prismaComment.createdAt
    );
  }
}