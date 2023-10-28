/**
 * Created by Soumya (soumyaranjansahoo338@gmail.com) on 8/11/2020 at 2:43 AM
 */
import moment from 'moment';
import { Application } from '../declarations';
import { ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';

export class Utils {
    _config: { otp: any; sms: any };
    _app: Application;
    /**
     *
     * @param app
     */
    constructor(app: Application) {
        this._config = {
            otp: app.get('otp'),
            sms: app.get('sms'),
        };

        this._app = app;
    }

    /**
     *
     * @returns app
     */
    get app() {
        return this._app;
    }

    /**
     *
     * @returns {{sms: any, otp: any}}
     */
    get config() {
        return this._config;
    }

    get otpMax() {
        return new Array(this.config.otp.length - 1).fill(10).reduce((a, b) => a * b);
    }

    /**
     *
     * @returns {number}
     */
    get newOtp() {
        const max = this.otpMax;
        return Math.floor(max + Math.random() * (9 * max));
    }

    /**
     *
     * @returns {number}
     */
    get newOTPExpireOn() {
        return Date.now() + 60 * this.config.otp.expireOn * 1000;
    }

    /**
     *
     * @param time {Date}
     * @returns {boolean}
     */
    isOTPExpired(time: Date) {
        return moment().isSameOrBefore(moment(time));
    }

    /**
     *
     * @param otp
     * @param phone
     * @param email
     * @param token
     * @param purpose
     * @param user
     * @param expireOn
     * @param endPoint
     */
    async setNewOTP(
        otp: string,
        phone: string | null,
        email: string | null,
        token: string,
        purpose: number,
        user: string | null,
        expireOn = this.newOTPExpireOn,
        endPoint = 'v1/otp',
    ) {
        const service: ServiceAddons<any> & Service = this.app.service(endPoint);

        return service._create({
            phone,
            email,
            otp,
            token,
            purpose,
            expireOn,
            user,
        });
    }

    /**
     *
     * @param otp
     * @param phone
     * @param email
     * @param purpose
     * @param user
     * @param endPoint
     */

    /**
     * @description remove OTP.
     * @param storedDataId
     * @param endPoint
     */
    async removeOTP(storedDataId: string, endPoint = 'v1/otp') {
        const service: Service & ServiceAddons<any> = this.app.service(endPoint);

        return await service._remove(storedDataId).catch(() => {
            // console.error(e);
        });
    }
}

function utils(app: Application) {
    app.set('utils', new Utils(app));
}

export default utils;
