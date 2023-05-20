import { asValue } from 'awilix';
import { inject } from 'awilix-express';
import ResponseTransformer from '../utils/ResponseTransformer';

module.exports = inject(({
    database, queries, helper, errors
}) => async(req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;

        if (!bearerToken) {
            return ResponseTransformer.error(
                req,
                res,
                new errors.Unauthorize('Invalid Bearer token')
            );
        }

        const token = bearerToken.split(' ')[1];

        if (!token) {
            return ResponseTransformer.error(
                req,
                res,
                new errors.Unauthorize('Invalid Public key provided')
            );
        }
        const client = await database.query.oneOrNone(queries.client.getClientByPublicKey, {
            public_key: token
        });

        if (!client) {
            return ResponseTransformer.error(
                req,
                res,
                new errors.Unauthorize('Invalid Public key provided')
            );
        }
        req.container.register({
            currentClient: asValue(client)
        });

        next();
    } catch (err) {
        console.log({ err });
        return ResponseTransformer.error(
            req,
            res,
            new errors.Unauthorize('Authorization Error')
        );
    }
});
