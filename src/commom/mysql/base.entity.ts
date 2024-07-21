import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";


export class BaseEntity {
    @PrimaryGeneratedColumn('uuid') 
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        default: null
    })
    updatedAt: Date;

    @Column({
        default: null
    })
    deletedAt: Date;
}