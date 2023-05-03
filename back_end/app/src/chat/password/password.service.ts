import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChannelService } from '../channel/channel.service';
import { RoleService } from '../role/role.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Channel, User } from '@prisma/client';
import * as argon2 from "argon2";

@Injectable()
export class PasswordService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly channelService: ChannelService,
		private readonly roleService: RoleService,
	) { }

	async checkPassword(channelName: string, password: string): Promise<boolean> {
		const channel: Channel = await this.channelService.getChannel(channelName);
		if (!channel) {
			throw new BadRequestException(`${channelName} was not found`);
		}

		const hashed_password: string = channel.password;
		try {
			return (argon2.verify(hashed_password, password));
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to check password');
		}
	}

	async changePassword(user: User, channelName: string, oldPassword: string, newPassword: string): Promise<void> {
		await this.checkCredentials(user, channelName, oldPassword);

		try {
			const hashed_password = await this.createHashedPassword(newPassword);

			await this.prisma.channel.update({
				where: {
					channelName: channelName,
				},
				data: {
					password: hashed_password,
				}
			})
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async deletePasswordAndSetChannelModeToPublic(user: User, channelName: string, password: string): Promise<void> {
		await this.checkCredentials(user, channelName, password);
		try {
			await this.prisma.channel.update({
				where: {
					channelName: channelName,
				},
				data: {
					password: '',
					channelMode: 'PUBLIC',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async setPasswordAndSetChannelModeToProtected(user: User, channelName: string, password: string): Promise<void> {
		await this.checkCredentials(user, channelName, '');
		try {
			const hashed_password = await this.createHashedPassword(password);

			await this.prisma.channel.update({
				where: {
					channelName: channelName,
				},
				data: {
					password: hashed_password,
					channelMode: 'PROTECTED',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	private async checkCredentials(user: User, channelName: string, password: string) {
		if (await this.roleService.getRole(user.intraId, channelName) !== 'OWNER') {
			throw new BadRequestException('User is not the owner of the channel and does not have the rights to change password');
		}
		if (await this.channelService.getChannelType(channelName) === 'DM') {
			throw new BadRequestException('Channel is a direct message and cannot have a password');
		}
		if (password !== '' && await this.checkPassword(channelName, password) === false) {
			throw new BadRequestException('Old password is not correct');
		}
	}

	async createHashedPassword(password: string): Promise<string> {
		const hashed_password: string = await argon2.hash(password);
		return (hashed_password);
	}
}
