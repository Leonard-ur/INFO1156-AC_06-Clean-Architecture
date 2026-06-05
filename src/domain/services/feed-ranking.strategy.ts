import { PostScore } from '../value-objects/post-score.vo';

/**
 * PostWithMetrics
 *
 * Tipo de dominio que representa un post enriquecido con sus métricas de
 * interacción. Es el objeto sobre el que operan las estrategias de ranking.
 *
 * No usa tipos de Prisma — solo primitivos y entidades del dominio.
 */
export interface PostWithMetrics {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  score: number;
}

/**
 * FeedRankingStrategy
 *
 * Interfaz del patrón Strategy para el ordenamiento del feed.
 *
 * PROBLEMA que resuelve:
 *   En el código original, el criterio de ordenamiento estaba hardcodeado
 *   dentro del servicio (múltiples if/switch). Agregar un nuevo criterio
 *   implicaba modificar el servicio central.
 *
 * SOLUCIÓN:
 *   Cada criterio de ordenamiento es una clase independiente que implementa
 *   esta interfaz. El servicio de aplicación solo conoce la interfaz, no la
 *   implementación concreta. Para agregar un nuevo criterio, se crea una nueva
 *   clase sin tocar nada existente (principio Open/Closed).
 */
export interface FeedRankingStrategy {
  rank<T extends PostWithMetrics>(posts: T[]): T[];
}

// ─── Implementaciones de estrategias ────────────────────────────────────────

/**
 * Ordena por fecha de creación descendente (más recientes primero).
 */
export class RecentRankingStrategy implements FeedRankingStrategy {
  rank<T extends PostWithMetrics>(posts: T[]): T[] {
    return [...posts].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}

/**
 * Ordena por cantidad de likes descendente (más populares primero).
 */
export class PopularRankingStrategy implements FeedRankingStrategy {
  rank<T extends PostWithMetrics>(posts: T[]): T[] {
    return [...posts].sort((a, b) => b.likesCount - a.likesCount);
  }
}

/**
 * Ordena por cantidad de comentarios descendente (más comentados primero).
 */
export class MostCommentedRankingStrategy implements FeedRankingStrategy {
  rank<T extends PostWithMetrics>(posts: T[]): T[] {
    return [...posts].sort((a, b) => b.commentsCount - a.commentsCount);
  }
}

/**
 * Ordena por score de relevancia descendente.
 * Usa el value object PostScore para calcular la puntuación de cada post.
 */
export class RelevanceRankingStrategy implements FeedRankingStrategy {
  rank<T extends PostWithMetrics>(posts: T[]): T[] {
    return [...posts]
      .map((post) => ({
        post,
        score: PostScore.calculate({
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          createdAt: post.createdAt,
        }).value,
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ post }) => post);
  }
}

// ─── Factory de estrategias ──────────────────────────────────────────────────

export type FeedOrderMode = 'recent' | 'popular' | 'most-commented' | 'relevance';

/**
 * FeedRankingStrategyFactory
 *
 * Fábrica que devuelve la estrategia correcta según el modo de ordenamiento.
 * Centraliza la decisión de qué estrategia usar, manteniendo los servicios limpios.
 */
export class FeedRankingStrategyFactory {
  static create(mode: FeedOrderMode): FeedRankingStrategy {
    switch (mode) {
      case 'popular':
        return new PopularRankingStrategy();
      case 'most-commented':
        return new MostCommentedRankingStrategy();
      case 'relevance':
        return new RelevanceRankingStrategy();
      case 'recent':
      default:
        return new RecentRankingStrategy();
    }
  }
}
