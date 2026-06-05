PROBLEMA CON LA DB
el problema que habia es que el código dependía de la base de datos, en otras palabras si por algún motivo se cambiama de base de datos
el sistema se rompería 
solución:
crear una capa de dominio pura (src/domain/) que separa la lógica de negocio de la base de datos. Para eso, se reemplazaron los tipos de prisma por entidades propias de typeScript y se movió el cálculo de relvancia del feed a componentes independientes. Finalmente, se definió interfaces y tokens de repositorios que actúan como contratos, así, el negocio ya no depende de una base de datos específica