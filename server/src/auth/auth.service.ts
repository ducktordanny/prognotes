import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {UserService} from 'src/db/user/user.service';
import {LoginResponse, UserResponse} from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  public async validateUser(
    username: string,
    password: string,
  ): Promise<UserResponse> {
    const user = await this.userService.getAUser(username);
    if (!user) throw new UnauthorizedException('Invalid username!');

    const {password: hashedPassword, ...result} = user;
    const isPasswordValid = await this.userService.verifyPassword(
      password,
      hashedPassword,
    );
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password!');

    return result;
  }

  public async login(user: UserResponse): Promise<LoginResponse> {
    const payload = {username: user.username, sub: user.id};
    return {
      ...user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
