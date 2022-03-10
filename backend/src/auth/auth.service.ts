import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationProvider } from './auth.interface';
import User from 'src/api/users/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Done } from './auth.interface';
import { UsersService } from 'src/api/users/users.service';
import { CreateUserDTO } from 'src/api/users/dto/create-user.dto';

/**
 * Create a new student user if not found in database
 */

@Injectable()
export class AuthService implements AuthenticationProvider {
  constructor(
    @Inject('USERS_SERVICE')
    private usersService: UsersService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async validateUser(details: CreateUserDTO) {
    const { student_id } = details;
    const user = await this.userRepo.findOne({ student_id });
    console.log(user);

    if (user) return user;
    return await this.createUser(details);
  }

  async validateUserGithub(details: CreateUserDTO) {
    const { github_id } = details;
    const user = await this.userRepo.findOne({ github_id });
    console.log(user);

    if (user) return user;
    return await this.createUser(details);
  }

  createUser(details: CreateUserDTO) {
    console.log('Creating User');
    return this.usersService.createUser(details);
  }

  findUser(id: number) {
    return this.userRepo.findOne({ id });
  }
}

/**
 * Handle session store in DB
 */

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthenticationProvider,
  ) {
    super();
  }

  serializeUser(user: User, done: Done) {
    done(null, user);
  }

  async deserializeUser(user: User, done: Done) {
    const userDB = await this.authService.findUser(user.id);
    return userDB ? done(null, userDB) : done(null, null);
  }
}