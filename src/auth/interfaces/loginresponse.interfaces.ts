import { User } from "../entities/user.entity";


//va a tener la info que queremos regresar.
//Así lucirá nuestro loginresponse
export interface loginResponse {

    user: User;
    token:string;
}