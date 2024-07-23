import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { RoleHasPermissions } from "./role_has_permissions.entity";
import { UserHasPermissions } from "./user_has_permissions.entity";

@Entity({name: "permissions"})
export class Permissions extends BaseEntity {
   
    @Column()
    name: string;

    @Column({name: "display_name"})
    displayName: string;

    @Column({name: "guard_name"})
    guardName: string;

    @Column({name: "is_activate", default: true})
    isActivate: boolean;

    @OneToMany(() => UserHasPermissions, userHasPermission => userHasPermission.permission)
    userHasPermission: UserHasPermissions[];


     @OneToMany(() => RoleHasPermissions, roleHasPermission => roleHasPermission.role)
    roleHasPermission: RoleHasPermissions[];

}