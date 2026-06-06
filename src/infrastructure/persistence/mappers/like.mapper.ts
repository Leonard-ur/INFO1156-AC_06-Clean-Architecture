import { Like as PrismaLike } from '@prisma/client';
import { Like } from '@/domain/entities/like.entity';
import { ReactionType } from '@/domain/value-objects/reaction-type.vo';

export class LikeMapper {
  static toDomain(prismaLike: PrismaLike): Like {
    // Validación segura del enum sin usar 'any' ni '!'
    const isValidReaction = Object.values(ReactionType).includes(
      prismaLike.reactionType as ReactionType
    );
    
    const reactionType = isValidReaction 
      ? (prismaLike.reactionType as ReactionType) 
      : ReactionType.LIKE; // Fallback por defecto

    return new Like(
      prismaLike.id,
      prismaLike.postId,
      reactionType,
      prismaLike.createdAt
    );
  }
}