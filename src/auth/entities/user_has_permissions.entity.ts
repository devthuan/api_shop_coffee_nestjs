import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Roles } from "./roles.entity";
import { Users } from "src/users/entities/users.entity";
import { Permissions } from "./permissions.entity";

@Entity({name: "user_has_permissions"})
export class UserHasPermissions extends BaseEntity {

    @ManyToOne(() => Permissions, permission => permission.userHasPermission)
    permission: Permissions;

    @ManyToOne(() => Users, user => user.userHasPermission)
    user: Users;

    @Column({name: "is_activate", default: true})
    isActivate: boolean;

}