/**
 * Input/Output Types para Application Layer
 * 
 * Estos tipos son independientes de frameworks y capas de presentación.
 * Los use cases trabajan con estos tipos, no con DTOs HTTP.
 */

// ─── Posts ───────────────────────────────────────────────────────────────────

export interface CreatePostInput {
    title: string
    description: string
    imageUrl: string
    categoryId?: string
}

export interface GetFeedPostsInput {
    categoryId?: string
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface CreateCommentInput {
    content: string
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export interface AddLikeInput {
    reactionType?: string
    weight?: number
}
