import { Body, Controller, Get, Post, Req, UseGuards, Param, UseInterceptors, BadRequestException, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtherUserIntraDto } from './dto/other-user-intra.dto';
import { UserElement } from './types';

import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
	constructor(private userService: UserService, private prisma: PrismaService) { }

	@Get('/')
	getUser(@Req() request): User {
		return (request.user);
	}

	@Get('users')
	returnUserElements(@Req() request): Promise<UserElement[]> {
		return (this.userService.getUserElements(request.user));
	}

	@UseGuards(JwtAuthGuard)
	@Post('block_user')
	blockUser(@Req() request, @Body() OtherUserIntraDto: OtherUserIntraDto) {
		return (this.userService.blockUser(request.user, OtherUserIntraDto.otherIntraId));
	}

	@UseGuards(JwtAuthGuard)
	@Post('unblock_user')
	unblockUser(@Req() request, @Body() OtherUserIntraDto: OtherUserIntraDto) {
		return (this.userService.unblockUser(request.user, OtherUserIntraDto.otherIntraId));
	}

	@UseGuards(JwtAuthGuard)
	@Get('usersexceptself')
	getUserListExceptSelf(@Req() request): Promise<User[]> {
		return (this.userService.getUserListExceptSelf(request.user));
	}

	@Get('createdummy')
	async createDummyUser(): Promise<void> {
		return (this.userService.createDummyUser());
    }

    @Get(':id')
	getUserElementBasedOnIntraId(@Req() request, @Param() params): Promise<UserElement> {
		const user: User = request.user;
		const otherIntraId: number = parseInt(params.id);
		return (this.userService.getUserElementBasedOnIntraId(user, otherIntraId));
	}

	@Post('avatar')
	@UseGuards(AuthGuard())
	@UseInterceptors(
		FileInterceptor('avatar', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
				},
			}),
			fileFilter: (req, file, cb) => {
				if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
					return cb(new BadRequestException('Only image files are allowed!'), false);
				}
				cb(null, true);
			},
		}),
	)
	async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
		return file.filename;
	}

}
