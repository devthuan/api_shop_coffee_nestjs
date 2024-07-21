import { BaseEntity } from "src/commom/mysql/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { Users } from "./users.entity";


@Entity({name: "user_information"})
export class UserInformation extends BaseEntity {

    @Column({name: "first_name"})
    firstName: string;

    @Column({name: "last_name"})
    lastName: string;

    @Column()
    gender: string;

    @Column({name: "date_of_birth"})
    dateOfBirth: Date;

    @Column({name: "phone_number"})
    phoneNumber: string;

    @Column()
    avatar: string;

    @Column()
    address1: string;

    @Column()
    address2: string;

    @OneToOne(() => Users)
    user: Users



}