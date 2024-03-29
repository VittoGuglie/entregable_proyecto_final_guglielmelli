const { Router } = require('express');
const { authToken } = require('../utils/jwt.utils');

class CustomRouter {
    constructor() {
        this.router = Router(),
            this.init()
    }

    init() { }

    getRouter() {
        return this.router;
    }

    handleRoute(path, method, policies, ...callbacks) {
        return new Promise((resolve, reject) => {
            method = method.toLowerCase();
            const httpMethod = this.router[method];
            if (!httpMethod) {
                throw new Error(`Invalid HTTP method: ${method}`);
            }

            httpMethod.call(
                this.router,
                path,
                this.handlePolicies(policies),
                this.generateCustomResponses,
                this.applyCallbacks(callbacks)
            );
        });
    }

    get(path, policies, ...callbacks) {
        this.router.get(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    put(path, policies, ...callbacks) {
        this.router.put(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    post(path, policies, ...callbacks) {
        this.router.post(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    patch(path, policies, ...callbacks) {
        this.router.patch(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    delete(path, policies, ...callbacks) {
        this.router.delete(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        );
    }
    
    applyCallbacks(callbacks) {
        return callbacks.map(callback => async (...params) => {
            try {
                await callback.apply(this, params);
            } catch (error) {
                console.log(error);
                params[1].status(500).json({ error });
            }
        })
    }

    generateCustomResponses(req, res, next) {
        res.sendSuccess = message =>
            res.status(200).json({ status: 'success', message });
        res.sendCreatedSuccess = message =>
            res.status(201).json({ status: 'success', message });
        res.sendServerError = error =>
            res.status(500).json({ status: 'error', error });
        res.sendUserError = error =>
            res.status(400).json({ status: 'error', error });

        next();
    }

    handlePolicies(policies) {
        return (req, res, next) => {
            if (Array.isArray(policies) && policies.includes('PUBLIC')) return next();

            const user = req.user;

            if (!user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            if (!policies.includes(user.role.toUpperCase())) {
                return res.status(403).json({ error: 'Not authorized' });
            }

            next();
        };
    }
}

module.exports = CustomRouter;