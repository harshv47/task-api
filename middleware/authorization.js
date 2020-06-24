const User = require('../model/user');
const Tokens = require('../model/apiToken');

const authCheck = async (req, res, next) => {
  try {
    // For swagger, Authorization is reserved
    // So using Security, without the Bearer part
    const tokenS = req.header('Security');
    // Using Bearer Token, so removing "Bearer " from the Auth header
    const tokenA = req.header('Authorization');

    if (!tokenA && !tokenS) {
      return res.status(400).send({
        error: true,
        message: 'No Authentication token',
      });
    }

    const token = (!tokenA) ? (tokenS) : (tokenA.replace('Bearer ', ''));

    //  Finding the user in the user collection
    const user = await User.findOne({ apiToken: token });
    const apiToken = await Tokens.findOne({ apiToken: token });

    const expiresAt = (!user) ? apiToken.apiExpiresAt : user.apiExpiresAt;

    //  Checking if the token has already expired
    // eslint-disable-next-line radix
    if (parseInt(expiresAt) <= Date.now() / 1000) {
      throw new Error({
        error: true,
        message: 'Token is expired',
      });
    }

    //  If the query returns null, then the user doesn't exist
    if (!user && !apiToken) {
      throw new Error();
    }

    //  Saving this information in the request, so these can be accessed in all auth routes
    req.token = token;
    // eslint-disable-next-line no-underscore-dangle
    req._id = (!user) ? apiToken._id : user._id;
    next();
  } catch (e) {
    res.status(401).send({
      error: true,
      message: 'Authentication Error',
    });
  }
};

module.exports = authCheck;
