import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';


@Module({
  controllers: [AuthController],
  providers: [AuthService],
  //error porque hice toda la configuracion, los imports, el mongoose schema y eso en app.module.
  imports: [
    //para variables de entorno es la linea de abajo
    ConfigModule.forRoot(),
    //el db puede ser el nombre en duro de la base de datos, pero como?
    MongooseModule.forRoot(process.env.MONGO_URI, {dbName: process.env.MONGO_DB_NAME}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema
      }
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JTW_SEED,
      signOptions: { expiresIn: '6h' }, })
  ]
})
export class AuthModule {}
