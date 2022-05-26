import passport from 'passport';
import passportLocal from 'passport-local';
import ppJWT from 'passport-jwt';
import User from './models/users';
import dotenv from 'dotenv';

dotenv.config();

const localStrategy = passportLocal.Strategy;
const JWTStrategy = ppJWT.Strategy;
const ExtractJWT = ppJWT.ExtractJwt;

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const getToken = (user) => {
    return jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: '1d',
    });
};

const opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

const jwtPassport = passport.use(
    new JWTStrategy(opts, (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    })
);
const verifyUser = passport.authenticate('jwt', { session: false });

export { getToken, jwtPassport, verifyUser };