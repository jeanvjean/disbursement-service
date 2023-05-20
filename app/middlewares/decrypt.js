import { asValue } from 'awilix';
import { inject } from 'awilix-express';
import ResponseTransformer from '../utils/ResponseTransformer';
import { decrypt } from '../utils/encryptionDecryption';

module.exports = inject(
  ({  errors, currentClient }) => async (req, res, next) => {
    try {
        const { secret_key, public_key} = currentClient;
        const decryptedBody = decrypt(req.body, secret_key, public_key )
        req.body = decryptedBody;
      return next();
    } catch (err) {
      console.log({ err });
      return ResponseTransformer.error(
        req,
        res,
        new errors.Unauthorize('Authorization Error')
      );
    }
  }
);
