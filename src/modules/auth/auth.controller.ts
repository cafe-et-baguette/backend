import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Response, Request } from "express";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { User } from "src/models/user.schema";

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserResponse {
  name: string;
  email: string;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const existingUser = await this.authService.findOne({ email });

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.authService.create({
      name,
      email,
      password: hashedPassword,
    });

    delete user.password;

    return user;
  }

  @Post("login")
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.findOne({ email: loginUserDto.email });

    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      throw new BadRequestException("invalid email credentials");
    }

    const jwt = await this.jwtService.signAsync({ email: user.email });

    response.cookie("jwt", jwt, {
      httpOnly: true,
    });

    return {
      message: "success",
    };
  }

  @Get("users")
  async getAll() {
    return this.authService.findAll();
  }

  @Get("user")
  async user(@Req() request: Request) {
    try {
      const cookie = request.cookies["jwt"];

      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this.authService.findOne({ email: data["email"] });

      const { password, ...result } = user["_doc"];

      return result;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Get("user/:userId")
  async userById(
    @Req() request: Request,
    @Param("userId") userId: string,
  ): Promise<User> {
    const cookie = request.cookies["jwt"];
    const data = await this.jwtService.verifyAsync(cookie);

    if (!data) {
      throw new UnauthorizedException();
    }

    return this.authService.userById(userId);
  }

  @Post("rename/:userId")
  async rename(
    @Req() request: Request,
    @Param("userId") userId: string,
    @Body() body: { name: string },
  ): Promise<User> {
    const cookie = request.cookies["jwt"];
    const data = await this.jwtService.verifyAsync(cookie);

    if (!data) {
      throw new UnauthorizedException();
    }

    const newName = body.name;

    return this.authService.renameUser(userId, newName);
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("jwt", { expires: new Date(0) });

    return {
      message: "success",
    };
  }
}
