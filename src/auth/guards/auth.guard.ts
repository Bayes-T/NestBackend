import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JtwInterface } from '../interfaces/interfaces.payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private JwtService:JwtService, private AuthService: AuthService){}

  async canActivate(
    context: ExecutionContext,): Promise<boolean> {

      //Esta request contiene toda la información, qué cliente la hizo, cuando, etc. En este caso la de getall porque fue donde puse el guard.
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      //Si no le pongo el try y catch y el seed no es, va a darme un jtwmalformado, por eso el manejo de errores con try y catch
      try {
            //Ojo, le agregué mi interfaz JtwInterface que es como debe lucir la constante payload. Si no puede extraer el payload el guard no deja pasar
        const payload = await this.JwtService.verifyAsync<JtwInterface>(
          token,
          {
            //Esta es la firma o semilla autorizada. Si fue plantada con una semilla diferente el guard no va a dejar pasar
            secret: process.env.ENV_SEED
          }
        );
          const user = await this.AuthService.findUserById(payload.id)
          if (!user){
            throw new UnauthorizedException('User does not exists')
          }
          if (!user.isActive){
            throw new UnauthorizedException('Not active')
          }
      //Pero si todo sale bien voy a colocar ese usuario con toda la info en la request
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = user
      } catch (error) {
        throw new UnauthorizedException()
      }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}


