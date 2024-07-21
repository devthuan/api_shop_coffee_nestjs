import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Roles } from "./roles.entity";
import { Permissions } from "./permissions.entity";

@Entity({name: "role_has_permissions"})
export class RoleHasPermissions extends BaseEntity {

    @Column({name: "is_activate", default: true})
    isActivate: boolean;

    @ManyToOne(() => Roles, role => role.roleHasPermission)
    role: Roles;

    @ManyToOne(() => Permissions, permission => permission.roleHasPermission)
    permission: Permissions;


}