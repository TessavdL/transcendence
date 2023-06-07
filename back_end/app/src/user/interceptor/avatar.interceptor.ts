import { BadRequestException, Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MAX_SIZE, UPLOADS_DIRECTORY } from '../utils/constants';

@Injectable()
export class AvatarInterceptor extends FileInterceptor('avatar', {
    storage: diskStorage({
        destination: UPLOADS_DIRECTORY,
        filename: (_, file, cb) => {
            const uniqueSuffix = Date.now();
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
    }),
    fileFilter: (_, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
            return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: MAX_SIZE
    }
}) { }
