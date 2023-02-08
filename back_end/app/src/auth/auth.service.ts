import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    login () {
        console.log('hello login');
    }

    register () {
        console.log('hello register');
    }
}
