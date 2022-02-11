import passport from "passport";
import { Strategy as jwtStatergy, ExtractJwt } from "passport-jwt";
import { Strategy as localStatergy } from "passport-local";

import config from "config";

import { HttpError } from "../utils/http-error";
import Account from "../models/account.model";



// json web token statergy
passport.use(new jwtStatergy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.get('JWT_SECRET')
}, async (payload, done) => {

    try {

        //find account specified in the token
        const account = await Account.findById(payload.sub);
        //if account doesn't exisit handle it

        if (!account) {
            return done(null, false);
        }

        // Deleted account
        if (account && account.is_deleted == true || account && account.active == false || account && account.is_suspened == true) {
            return done(null, false);
        }

        //otherwise return the account
        done(null, account);

    } catch (error) {
        done(error, false);
    }
}));


// local statergy

passport.use(new localStatergy({
    passReqToCallback: true,
    usernameField: 'email'
}, async (req, email, password, done) => {
    try {

        // find the account from given email
        const account = await Account.findOne({ email }).populate('account');

        // if not found handle it
        if (!account) {
            return done(new HttpError('Wrong credentials, please try again', 403), false);
        }

        // account not actived
        if (account && account.active == false) {
            return done(new HttpError('Your account is not active, please contact our help desk support@ghatz.io', 403), false);
        }

        // account is suspened
        if (account && account.is_suspened == true) {
            return done(new HttpError('Your account is suspened temporarily, please contact our help desk support@ghatz.io', 403), false);
        }

        // if account found check password is correct
        const isMatch = await account.isValidPassword(password);
        if (!isMatch) {
            return done(new HttpError('Wrong Password, please try again', 403), false);
        }
        // otherwise , return the account
        done(null, account);
    } catch (error) {
        done(error, false);
    }
}));

export { passport as passportConfig };