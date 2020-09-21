function usersOnly(req, res, next) {
  if(req.user) next();
  else res.status(401).send('Unauthorized');
}

exports.usersOnly = usersOnly;
