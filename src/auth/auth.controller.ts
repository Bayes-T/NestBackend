import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { JtwInterface } from './interfaces/interfaces.payload';
import { User } from './entities/user.entity';
import { loginResponse } from './interfaces/loginresponse.interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  //el argumento es el body de la petición
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: loginDto){
    return this.authService.login(loginDto)
  }

  @Post('/register')
  register(@Body() CreateUserDto: CreateUserDto){
    return this.authService.register(CreateUserDto)
  }

  //aca va lo que retorna el servidor
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req:Request) {
    //aca hay un tema de biding entre el controller y el guard, la info pasa del guard para acá
    const user = req['user']
    // return user
    //Así puedo obtener finalmente toda la info del usuario que yo quiero que retorne el servidor. Esto es un ejemeplo, lo que yo querría regresar sería todos los datos si el JWT es válido. Pero es para demostrar que se puede acceder a quién hizo la petición.
    return this.authService.findAll()
  }

  //check token debe recibir una petición, que esté debidamente autenticada con un jwt y regresar una nueva instancia de login response, que tiene el usuario y el token. O sea un usuario cualquiera autenticado hace una una petición get check-token, lo que estoy verificando es que tenga un jwt válido. Así será para muchas tareas, que para poder hacer peticiones tenga el jwt válido. Esto aplicando el guard y la ruta del get. Esa es la gracia del ejemplo.

  //Aunque también como genera un unuevo jwt, cada vez que se envía esta petición observa si tiene el jwt y como genera un jwt nuevo si es válido, prolonga la vida del jwt usando ahora éste último. ¿Pero cómo? Si simplemente estoy retornando en el servidor un nuevo JWT? El funcionamiento del JWT es que cada vez que se genere uno vuelva a empezar su ciclo de vida? Parece, porque cada vez que hago un login el JWT ES DISTINTO.

  @UseGuards(AuthGuard)
  @Get('check-token')
  CheckToken(@Request() req:Request):loginResponse{
    const user = req['user'] as User
    return {
      user: user,
      //como está implícito que getjwt recibe un payload, puedo mandarle un objeto que tenga las propiedades del payload, en este caso el id de la constante que creé user. NO ES PORQUE ESTÉ IMPLÍCITO EL PAYLOAD, ES PORQUE CONSTRUYO UN OBJETO A PARTIR DE UNA CONSTANTE QUE YA TENÍA. mirar esto como hacia con rxjs
      token: this.authService.getJwt({id: user._id})
    }
    //me da la info del usuario, pero me genera un jwt cada vez, porque estoy llamando la función que crea el token a partir de un id, al final. El guard ve que se trate de un JWT válido.
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
