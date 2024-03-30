import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { publicKey } from "src/utils/keys";
import { JwtPayload } from "../interface/jwt.interface";
import { UserService } from "src/modules/user/user.service";
import { User } from "src/modules/user/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: publicKey,
        });
    }

    async validate(payload: JwtPayload) {
        const { uuid } = payload;
        const user: User = await this.userService.findUserById(uuid);
        if (!user) {
            throw new UnauthorizedException();
        }
        delete user.password;
        return user;
    }
}