import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter : any;

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST ,
            port: parseInt(process.env.MAIL_PORT),
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
    }


    async sendEmail(email: string, subject: string, text: string, html: string) : Promise<string> {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: subject,
            text: text,
            html: `<td style="font-size:11px;font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;padding:14px 32px 14px 32px;background-color:#f2f2f2;border-left:1px solid #ccc;border-right:1px solid #ccc;border-top:1px solid #ccc;border-bottom:1px solid #ccc;text-align:center;border-radius:7px;display:block;border:1px solid #1877f2;background:#e7f3ff"><span style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:16px;line-height:21px;color:#141823"><span style="font-size:17px;font-family:Roboto;font-weight:700;margin-left:0px;margin-right:0px">
                    ${html}
                    </span></span>
                    </td>`
        };
       
        return await this.transporter.sendMail(mailOptions);
    }

}
