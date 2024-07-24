import { UserHasPermissions } from "src/auth/entities/user_has_permissions.entity";
import { UserHasRoles } from "src/auth/entities/user_has_roles.entity";
import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "users"})
export class Users extends BaseEntity {

    @Column({unique: true})
    email: string

    @Column()
    password: string

    @Column()
    ip: string

    @Column()
    balance: number

    @Column({name: "is_activate", default: false})
    isActive: boolean

    @Column({name: "type_login"})
    typeLogin: string

    @Column({name: "last_login"})
    lastLogin: Date


    @OneToMany(() => UserHasRoles, userHasRole => userHasRole.user)
    userHasRole: UserHasRoles[]

    @OneToMany(() => UserHasPermissions, UserHasPermissions => UserHasPermissions.user)
    userHasPermission: UserHasPermissions[]


}
