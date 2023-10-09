import {IsEmail, IsString, MinLength} from 'class-validator'

export class CreateUserDto {
    @IsEmail()
    email:string;
    @IsString()
    name: string;
    @MinLength(6)
    password: string;

    //No voy a agregar ni rol ni está activo porque no quiero que esto lo modifique el usuario
}
