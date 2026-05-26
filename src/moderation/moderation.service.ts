import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"

export type ModerationResult = {
    approved: boolean
    reason?: string
    category?: string
}

const buildFuzzyRegex = (word: string) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(escaped.split("").join("[^a-zA-Z0-9]*"), "gi")
}

@Injectable()
export class ModerationService {
    constructor(private readonly prisma: PrismaService) {}

    async moderate(text: string): Promise<ModerationResult> {
        const words = await this.prisma.prohibitedWord.findMany()

        for (const pw of words) {
            const regex = buildFuzzyRegex(pw.word)
            if (regex.test(text)) {
                return {
                    approved: false,
                    reason: `Contiene palabra prohibida: "${pw.word}"`,
                    category: pw.category,
                }
            }
        }

        return { approved: true }
    }

    findAll() {
        return this.prisma.prohibitedWord.findMany({
            orderBy: { createdAt: "desc" },
        })
    }

    create(word: string, category: string) {
        return this.prisma.prohibitedWord.create({ data: { word, category } })
    }

    async delete(id: string) {
        try {
            return await this.prisma.prohibitedWord.delete({ where: { id } })
        } catch (err: unknown) {
            if (
                err instanceof Error &&
                "code" in err &&
                (err as { code: string }).code === "P2025"
            ) {
                throw new NotFoundException("Palabra prohibida no encontrada")
            }
            throw err
        }
    }
}
