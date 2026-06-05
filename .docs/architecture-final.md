# Arquitectura Limpia - Diagrama Final Corregido

## 1. Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP Request/Response
                             │
         ┌───────────────────▼────────────────────┐
         │    HTTP LAYER (Presentación)           │
         │  src/http/controllers/                 │
         │  src/http/dtos/                        │
         │                                        │
         │ • Recibe HTTP requests                 │
         │ • Valida DTOs (@Body, class-validator) │
         │ • Transforma DTO → Input Types         │
         │ • Llama use cases                      │
         │ • Retorna HTTP responses               │
         └───────────────────┬────────────────────┘
                             │
                    Application Input
                             │
         ┌───────────────────▼────────────────────┐
         │ APPLICATION LAYER (Lógica Negocio)     │
         │  src/application/use-cases/            │
         │  src/application/types/                │
         │                                        │
         │ • Encapsula lógica de negocio          │
         │ • Recibe tipos simples (no DTOs)       │
         │ • Independiente de frameworks          │
         │ • Reutilizable en cualquier contexto   │
         │ • Fácil de testear                     │
         └───────────────────┬────────────────────┘
                             │
                   Persistencia/Externos
                             │
         ┌───────────────────▼────────────────────┐
         │ INFRASTRUCTURE LAYER (Datos/Externos)  │
         │  src/shared/prisma.service.ts          │
         │  src/moderation/                       │
         │  src/categories/                       │
         │                                        │
         │ • Acceso a base de datos               │
         │ • Servicios externos (Moderación)      │
         │ • Cualquier dependencia externa        │
         └────────────────────────────────────────┘
```

---

## 2. Flujo Completo: Crear un Post

```
1. CLIENT
   POST /api/posts
   {
       "title": "Mi Post",
       "description": "Contenido del post...",
       "imageUrl": "https://example.com/img.jpg",
       "categoryId": "cat-123"
   }

   │
   ▼ HTTP Request

2. HTTP LAYER - PostsController
   @Post()
   async create(@Body() body: CreatePostDto) {
       ✓ DTO validado automáticamente
       ✓ Transforma CreatePostDto → CreatePostInput
       
       const created = await this.createPostUseCase.execute({
           title: body.title,
           description: body.description,
           imageUrl: body.imageUrl,
           categoryId: body.categoryId,
       })
       
       return { ok: true, payload: created }
   }
   
   │
   ▼ CreatePostInput (tipo simple, sin validadores)

3. APPLICATION LAYER - CreatePostUseCase
   async execute(data: CreatePostInput) {
       // Validación de negocio
       const text = `${data.title} ${data.description}`
       const moderation = await this.moderationService.moderate(text)
       
       if (!moderation.approved) {
           throw new BadRequestException(moderation.reason)
       }
       
       // Persistencia
       return await this.prisma.post.create({ data })
   }
   
   │
   ▼ Database

4. INFRASTRUCTURE LAYER - Prisma
   INSERT INTO posts (title, description, imageUrl, categoryId, ...)
   VALUES (...)
   
   │
   ▼ Post Entity

5. APPLICATION LAYER - Returns
   {
       id: "post-123",
       title: "Mi Post",
       description: "Contenido...",
       imageUrl: "...",
       categoryId: "cat-123",
       createdAt: "2026-06-05T...",
       ...
   }
   
   │
   ▼ HTTP Response

6. HTTP LAYER - Response
   200 OK
   {
       "ok": true,
       "payload": {
           id: "post-123",
           ...
       }
   }
   
   │
   ▼

7. CLIENT
   Recibe respuesta exitosa
```

---

## 3. Estructura de Directorios Definitiva

```
src/
│
├── http/                          ← PRESENTATION LAYER
│   ├── controllers/
│   │   ├── posts.controller.ts
│   │   ├── comments.controller.ts
│   │   └── likes.controller.ts
│   ├── dtos/
│   │   └── index.ts               ← DTOs con validadores
│   └── http.module.ts
│
├── application/                   ← APPLICATION LAYER
│   ├── use-cases/
│   │   ├── posts/
│   │   │   ├── create-post.use-case.ts
│   │   │   ├── get-all-posts.use-case.ts
│   │   │   ├── get-feed-posts.use-case.ts
│   │   │   └── index.ts
│   │   ├── comments/
│   │   │   ├── create-comment.use-case.ts
│   │   │   ├── list-comments.use-case.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts               ← Input/Output types (sin decoradores)
│   └── application.module.ts
│
├── domain/                        ← DOMAIN LAYER
│   ├── entities/
│   │   ├── post.entity.ts
│   │   ├── comment.entity.ts
│   │   ├── like.entity.ts
│   │   └── category.entity.ts
│   ├── repositories/
│   │   └── index.ts
│   ├── services/
│   │   └── feed-ranking.strategy.ts
│   ├── value-objects/
│   │   ├── post-score.vo.ts
│   │   └── reaction-type.vo.ts
│   └── index.ts
│
├── infrastructure/                ← INFRASTRUCTURE LAYER
│   ├── repositories/
│   │   └── (future implementations)
│   └── infrastructure.module.ts
│
├── shared/                        ← SHARED/UTILITIES
│   ├── prisma.service.ts
│   ├── prisma.module.ts
│   └── dtos/
│       └── index.ts               ← Re-exports desde @/http/dtos
│
├── moderation/                    ← DOMAIN/SERVICE
│   ├── moderation.controller.ts
│   ├── moderation.service.ts
│   ├── moderation.dtos.ts
│   ├── moderation.module.ts
│   └── moderation.module.ts
│
├── categories/                    ← DOMAIN/SERVICE
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.module.ts
│   └── categories.module.ts
│
├── likes/                         ← DOMAIN/SERVICE
│   ├── likes.controller.ts
│   ├── likes.service.ts
│   └── likes.module.ts
│
├── posts/                         ← LEGACY (para compatibilidad)
│   ├── posts.dtos.ts              ← Re-exports desde @/shared/dtos
│   ├── posts.module.ts
│   ├── feed-ranking.strategy.ts
│   ├── posts.controller.ts        ← NO USADO (en src/http/)
│   └── posts.service.ts           ← NO USADO (lógica en use cases)
│
├── comments/                      ← LEGACY (para compatibilidad)
│   ├── comments.module.ts
│   ├── comments.controller.ts     ← NO USADO (en src/http/)
│   └── comments.service.ts        ← NO USADO (lógica en use cases)
│
├── app.module.ts                  ← ROOT MODULE
└── main.ts
```

---

## 4. Patrones de Importación Permitidos

### ✅ CORRECTO

```typescript
// Dentro de HTTP Layer (pueden importar DTOs)
import { CreatePostDto } from "@/http/dtos"
import { CreatePostUseCase } from "@/application/use-cases"

// Dentro de Application Layer (pueden importar tipos de aplicación)
import { CreatePostInput } from "@/application/types"
import { PrismaService } from "@/shared/prisma.service"
import { ModerationService } from "@/moderation/moderation.service"

// Dentro de Infrastructure (pueden importar cualquier cosa)
import { PrismaClient } from "@prisma/client"
```

### ❌ INCORRECTO

```typescript
// Application Layer NO puede importar DTOs
import { CreatePostDto } from "@/http/dtos"  ❌ VIOLACIÓN

// Application Layer NO puede importar Controllers
import { PostsController } from "@/http/controllers"  ❌ VIOLACIÓN

// HTTP Layer NO debe tener lógica de negocio
export class PostsController {
    async create(@Body() body: CreatePostDto) {
        // ❌ Lógica de negocio aquí
        const moderation = await this.moderationService.moderate(...)
        return this.prisma.post.create(...)  // ❌ Acceso directo a DB
    }
}
```

---

## 5. Responsabilidades por Capa

### HTTP Layer (src/http/)
**Responsabilidades:**
- Recibir y validar HTTP requests
- Mapear rutas HTTP
- Validar DTOs con decorators (class-validator)
- Transformar DTOs a tipos de aplicación
- Llamar use cases
- Formatear respuestas HTTP

**NO debe:**
- Contener lógica de negocio
- Acceder directamente a Prisma
- Tomar decisiones sobre datos

### Application Layer (src/application/)
**Responsabilidades:**
- Orquestar lógica de negocio
- Coordinar entre servicios
- Validar reglas de negocio
- Llamar a infraestructura
- Retornar resultados

**NO debe:**
- Conocer de DTOs HTTP
- Saber que existe un controller
- Implementar detalles de persistencia
- Asumir un framework específico

### Infrastructure Layer (src/shared/, src/moderation/, etc.)
**Responsabilidades:**
- Acceder a base de datos
- Llamar APIs externas
- Implementar servicios técnicos
- Gestionar conexiones

**NO debe:**
- Contener lógica de negocio
- Asumir cómo se utilizará

---

## 6. Testing por Capa

### Test Application Layer (sin HTTP)
```typescript
describe('CreatePostUseCase', () => {
    // ✅ Solo necesita mocks de infraestructura
    // ✅ Sin NestJS, sin decorators
    // ✅ Fácil de ejecutar
    
    it('should create post when moderation approves', async () => {
        const useCase = new CreatePostUseCase(
            mockPrisma,
            mockModerationService,
        )
        
        const result = await useCase.execute({
            title: 'Test',
            description: 'Description',
            imageUrl: 'https://...',
        })
        
        expect(result.id).toBeDefined()
    })
})
```

### Test HTTP Layer (con DTOs)
```typescript
describe('PostsController', () => {
    // ✅ Testa validación de DTOs
    // ✅ Testa transformación DTO → tipo aplicación
    // ✅ Testa manejo de respuestas HTTP
    
    it('should validate post title length', async () => {
        const dto = new CreatePostDto()
        dto.title = 'AB'  // Muy corto
        
        const errors = await validate(dto)
        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('title')
    })
})
```

### Test Integration (con NestJS TestingModule)
```typescript
describe('Posts Integration', () => {
    // ✅ Testa HTTP → Controller → Use Case → Prisma
    // ✅ Con NestJS módules
    // ✅ Con middleware real
    
    it('should create post via HTTP', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/posts')
            .send({
                title: 'Test Post',
                description: 'Description here',
                imageUrl: 'https://example.com/img.jpg',
            })
            .expect(201)
        
        expect(response.body.ok).toBe(true)
    })
})
```

---

## 7. Ventajas de Esta Arquitectura

| Característica | Beneficio |
|---------------|----------|
| **Separación de capas** | Cambios en HTTP no afectan lógica de negocio |
| **Independencia de framework** | Use cases funcionan sin NestJS |
| **Testabilidad** | Tests rápidos sin contexto HTTP |
| **Reutilización** | Mismos use cases para CLI, GraphQL, WebSocket |
| **Mantenibilidad** | Código organizado y predecible |
| **Escalabilidad** | Fácil agregar nuevas funcionalidades |
| **Compatibilidad** | DTOs re-exportados para código existente |

---

## 8. Checklist de Validación

- ✅ **HTTP Controllers** solo reciben DTOs y llaman use cases
- ✅ **Use Cases** reciben tipos simples, no DTOs
- ✅ **Application Layer** no importa nada de HTTP
- ✅ **DTOs** están en `src/http/dtos/`
- ✅ **Tipos de aplicación** están en `src/application/types/`
- ✅ **Transformación** ocurre en el controller (boundary)
- ✅ **Sin referencias circulares** entre módulos
- ✅ **Compatible hacia atrás** con importaciones antiguas
- ✅ **Tests** pueden ejecutarse sin NestJS context
- ✅ **Código muerto** no se carga (controllers antiguos)
