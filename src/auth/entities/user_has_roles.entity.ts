import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Roles } from "./roles.entity";
import { Users } from "src/users/entities/users.entity";

@Entity({name: "user_has_role"})
export class UserHasRoles extends BaseEntity {

    @ManyToOne(() => Roles, role => role.userHasRole)
    role: Roles;

    @ManyToOne(() => Users, user => user.userHasRole)
    user: Users;

    @Column({name: "is_activate", default: true})
    isActivate: boolean;

}