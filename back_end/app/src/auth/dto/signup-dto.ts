import { IsString, Length, Matches } from 'class-validator';

export class SignupDto {
    @IsString()
    name: string;
  
    @IsString()
    @Length(8, 20, { message: 'Password must be between 8 and 20 characters.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    })
    password: string;
  }