const jwt = require('jsonwebtoken');

const middleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log("Token manquant");
    return res.status(401).json({ error: 'Token manquant. Veuillez vous connecter.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Token valide :", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Erreur de token :", err.message);
    return res.status(403).json({ error: 'Token invalide ou expiré.' });
  }
};

module.exports = middleware;