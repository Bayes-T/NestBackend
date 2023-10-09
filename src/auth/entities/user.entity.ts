import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    _id?: string
    @Prop({unique: true, required: true})
    email: string;

    @Prop({required: true})
    name: string;

    //es requerida para el usuario, pero es opcional en lo que retorna el servicio con metodo create, para poder hacer el return sin la contraseña. Pero igual queda en la base de datos. Creo que es necesario enviarlo así para que en el BODY de la petición u otros lugares no se vea la contraseña. Sólo que se guarde en la base de datos, así esté encriptada.
    @Prop({required: true, minlength:6})
    password?: string;



    @Prop({default: true})
    isActive?: boolean;

    @Prop({type: [String], default: ['user']})
    roles?: string[]
}

export const userSchema = SchemaFactory.createForClass(User)