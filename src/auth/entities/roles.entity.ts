import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { RoleHasPermissions } from "./role_has_permissions.entity";
import { UserHasRoles } from "./user_has_roles.entity";

@Entity({name: "roles"})
export class Roles extends BaseEntity {
    @Column()
    name: string;

    @Column({name: "display_name"})
    displayName: string;

    @Column({name: "guard_name"})
    guardName: string;

    @Column({name: "is_activate", default: true})
    isActivate: boolean;

    @OneToMany(() => RoleHasPermissions, roleHasPermission => roleHasPermission.role)
    roleHasPermission: RoleHasPermissions[];

    @OneToMany( () => UserHasRoles, userHasRoles => userHasRoles.role)
    userHasRole: UserHasRoles[]

}