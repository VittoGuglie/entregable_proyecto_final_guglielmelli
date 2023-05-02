const { Router } = require('express');
const Users = require('../../dao/models/Users.model');
const { hashPassword } = require('../../utils/cryptPassword.utils');
const passport = require('passport');

const router = Router();

router.post('/', (passport.authenticate('login', { failureRedirect: '/auth/faillogin' }), async (req, res) => {
    try {
        if (!req.user)
            return res
                .status(401)
                .json({ status: 'error', error: 'Usuario y contraseña no coinciden' })

        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
        }

        res.json({ status: 'success', message: 'Sesión iniciada' })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
})
);

router.patch('/forgotPassword', async (req, res) => {
    try {
        const { email, password } = req.body;
        const passwordEncrypted = hashPassword(password);
        await Users.updateOne({ email }, { password: passwordEncrypted });

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.json({ error: error.message });
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) return res.json({ error });
        res.redirect('/login');
    });
});

router.get(
    '/github',
    passport.authenticate('github', { scope: ['user: email'] }),
    async (req, res) => { }
);

router.get(
    '/githubcallback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    async (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    }
);

module.exports = router;