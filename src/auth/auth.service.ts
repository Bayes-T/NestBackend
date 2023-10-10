import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { loginDto } from './dto/login.dto';
import { JtwInterface } from './interfaces/interfaces.payload';
import { loginResponse } from './interfaces/loginresponse.interfaces';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
    ){}

  async create(createUserDto: CreateUserDto): Promise<User>{

    try {
      const {password, ...userData} = createUserDto
      const newUser = new this.userModel({
        password : bcryptjs.hashSync(password, 10),
        ...userData
      })
      //aqui lo guardo, con la contraseña encriptada y lo envio a la base de datos
      await newUser.save()

      //ahora le retiro la contraseña desestructurando y guardando solo el ...user, que es todo menos la contraseña
      //le puse de nombre a password _ porque ya tengo una constante llamada password arriba
      const {password:_, ...user} = newUser.toJSON()
      return user
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email} already exists`)
      }
      throw new InternalServerErrorException('Something terrible happened!!')
    }

  }

async  login(loginDto: loginDto):Promise<loginResponse>{
    const {email, password} = loginDto

    //el :email y :password es redundante, pero quiere decir que busque un email que sea igual al que mande como argumento
    const user = await this.userModel.findOne({email:email})

    if(!user){
      throw new UnauthorizedException('Not valid credentials - No User')
    }

    //user es la constante que creé que es igual al objeto usuario que coincide con el email. Por lo tanto es el usuario que busco y con el que tengo que comparar la contraseña encriptada
    if(!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials - Password')
    }

    //user es una instancia de user model, que defini en el constructor como de tipo USER (la entidad, por eso tiene todas las propiedades)
    //recordemos que el user.json también tiene la contraseña y el resto de info también
    const {password:_, ...rest} = user.toJSON()
    //retorno un objeto con todo menos la contraseña y le agrego el token
    return {
      user: rest,
      token: this.getJwt({id: user.id})
    }
  }

  async register(CreateUserDto:CreateUserDto):Promise<loginResponse>{

    // let user:User =  {
    //   email:"",
    //   name: "",
    //   password: "",
    //   _id: ""

    // await this.create(CreateUserDto).then(value => user = value)

    //no es necesario crear el objeto vacío, ya que usando this.create generará directamente un objetio de tipo user, dandole yo los 3 argumentos que necesita.
    const user = await this.create(CreateUserDto)
    const token = this.getJwt({id: user._id})

    return {
     user: user,
     token: token
   }

  }
    
  findAll():Promise<User[]> {
    //user model es la instancia del schema user, y tiene metodos, es propio de mongoDB.
    return this.userModel.find()
  }

  
  async findUserById(id:string){
    const user = await this.userModel.findById(id)
    const {password, ...rest} = user.toJSON()
    return rest
  }



  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  //funcion que si le paso un objeto de tipo jtwinterface me devolvera el token
  //toma el id y devuelve el JWT
  getJwt(payload: JtwInterface){
    const token = this.jwtService.sign(payload)
    return token
  }
}
