import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
const K = 20;

@Injectable()
export class GameService {
	constructor(private readonly prisma: PrismaService, private readonly userService: UserService) { }

	async update_win_loss_elo(winner: User, loser: User): Promise<void> {
		const { newWinnerElo, newLoserElo }: { newWinnerElo: number, newLoserElo: number } = this.calculate_new_elo(winner.elo, loser.elo);
		await this.update_winner(winner.intraId, newWinnerElo);
		await this.update_loser(loser.intraId, newLoserElo);
	}

	async update_win_loss_elo_based_on_intraId(winnerIntraId: number, loserIntraId: number): Promise<void> {
		const winnerUser: User = await this.userService.getUserBasedOnIntraId(winnerIntraId);
		const loserUser: User = await this.userService.getUserBasedOnIntraId(loserIntraId);
		const { newWinnerElo, newLoserElo }: { newWinnerElo: number, newLoserElo: number } = this.calculate_new_elo(winnerUser.elo, loserUser.elo);
		await this.update_winner(winnerIntraId, newWinnerElo);
		await this.update_loser(loserIntraId, newLoserElo);
	}

	private calculate_new_elo(winnerElo: number, loserElo: number): { newWinnerElo: number, newLoserElo: number } {
		const expectedEloWinner: number = 1 / (1 + (10 ** ((loserElo - winnerElo) / 400)));
		const eloChange = K * (1 - expectedEloWinner);
		const newWinnerElo: number = Math.round(winnerElo + eloChange);
		const newLoserElo: number = Math.round(loserElo - eloChange);
		return {
			newWinnerElo,
			newLoserElo
		}
	}

	private async update_winner(winnerIntraId: number, newWinnerElo: number): Promise<void> {
		try {
			await this.prisma.user.update({
				where: {
					intraId: winnerIntraId,
				},
				data: {
					wins: {
						increment: 1,
					},
					elo: newWinnerElo,
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException("Prisma failed to update user.wins");
		}
	}

	private async update_loser(loserIntraId: number, newLoserElo: number): Promise<void> {
		try {
			await this.prisma.user.update({
				where: {
					intraId: loserIntraId,
				},
				data: {
					losses: {
						increment: 1,
					},
					elo: newLoserElo,
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException("Prisma failed to update user.losses");
		}
	}
}
