import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
//OJO, EL CONFIGMODULE, CON EL MONGOOSE Y ESO EL PROF LO HIZO AQUI Y YO LO TENGO EN AUTH. YA HICE GIT  ADD  POR SI ACASO

@Module({
  imports: [
    AuthModule,
  ],
})
export class AppModule {
  constructor(){}
}
