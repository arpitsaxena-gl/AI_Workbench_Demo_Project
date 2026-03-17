var { expressjwt: jwt } = require("express-jwt");
function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({
    secret: secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/product(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/category(.*)/, method: ["GET", "OPTIONS"] },
      `${api}/user/validateLogin`,
      `${api}/user/register`,
      `${api}/order`,
    ],
  });
}
async function isRevoked(req, payload, done) {
  console.log("isrevoke *** " + payload.payload);
  if (!payload.payload.isAdmin) {
    return true;
  }
  return false;
}
module.exports = authJwt;
