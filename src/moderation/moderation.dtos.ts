import { IsNotEmpty, IsString, Length } from "class-validator"

export class CreateProhibitedWordDto {
    @IsString({ message: "La palabra debe ser un texto" })
    @IsNotEmpty({ message: "La palabra no puede estar vacía" })
    @Length(1, 100, {
        message: "La palabra debe tener entre 1 y 100 caracteres",
    })
    word!: string

    @IsString({ message: "La categoría debe ser un texto" })
    @IsNotEmpty({ message: "La categoría no puede estar vacía" })
    @Length(1, 50, {
        message: "La categoría debe tener entre 1 y 50 caracteres",
    })
    category!: string
}
