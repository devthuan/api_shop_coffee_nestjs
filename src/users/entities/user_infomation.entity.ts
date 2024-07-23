import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Users } from "./users.entity";


@Entity({name: "user_information"})
export class UserInformation extends BaseEntity {

    @Column({name: "first_name", nullable: true})
    firstName: string;

    @Column({name: "last_name", nullable: true})
    lastName: string;

    @Column({nullable: true})
    gender: string;

    @Column({name: "date_of_birth", nullable: true})
    dateOfBirth: Date;

    @Column({name: "phone_number", nullable: true})
    phoneNumber: string;

    @Column({nullable: true})
    avatar: string;

    @Column({nullable: true})
    address1: string;

    @Column({nullable: true})
    address2: string;

    @OneToOne(() => Users)
    @JoinColumn({name: "user_id"})
    user: Users



}