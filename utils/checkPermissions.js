const UnauthorizedError = require('../errors/unauthorized');

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return;
  if (requestUser.userId !== resourceUserId.toString()) {
  
    throw new UnauthorizedError('Not authorized to access this route')
  }

  
};

module.exports = checkPermissions;
