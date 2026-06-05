import { Module } from "@nestjs/common"
import { InfrastructureModule } from "@/infrastructure/infrastructure.module"
import { ApplicationModule } from "@/application/application.module"
import { HttpModule } from "@/http/http.module"

/**
 * AppModule: Punto de entrada de la aplicación
 * 
 * Estructura de capas (en orden de dependencia):
 * 1. InfrastructureModule: Acceso a datos, servicios externos
 * 2. ApplicationModule: Lógica de negocio (use cases)
 * 3. HttpModule: Controllers HTTP, presentación
 */
@Module({
    imports: [
        InfrastructureModule,
        ApplicationModule,
        HttpModule,
    ],
})
export class AppModule {}
