import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
	movement(movement: string): number {
		if (movement ==='up') {
			console.log(-25);
			return (-25);
		}
		else if (movement === 'down') {
			console.log(25);
			return (25);
		}
		else {
			console.log('invalid');
			return (0);
		}
	}
}
