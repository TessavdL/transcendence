import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { User } from "@prisma/client";

export const GetUser = createParamDecorator(
    (data: unknown, context: ExecutionContext): User => {
        console.log("HERE");
        const request = context.switchToHttp().getRequest();
        return request.user;
    },
);