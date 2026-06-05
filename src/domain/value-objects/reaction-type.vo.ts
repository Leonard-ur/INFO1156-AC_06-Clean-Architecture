/**
 * Value object: ReactionType
 *
 * Enum de dominio que representa los tipos de reacción posibles en una publicación.
 * Al definirlo aquí en el dominio (y no importarlo de Prisma), el negocio no depende
 * de la base de datos para conocer sus propios conceptos.
 *
 * La capa de infraestructura es responsable de mapear este valor al enum de Prisma.
 */
export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}
