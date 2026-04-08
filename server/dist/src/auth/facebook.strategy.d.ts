import { Profile, Strategy } from 'passport-facebook';
declare const FacebookStrategy_base: new (...args: [options: import("passport-facebook").StrategyOptionsWithRequest] | [options: import("passport-facebook").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class FacebookStrategy extends FacebookStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any, info?: any) => void): Promise<any>;
}
export {};
