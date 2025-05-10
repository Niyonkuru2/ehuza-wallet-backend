//user Authentication Middleware

import jwt  from "jsonwebtoken"

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "You are Not Authorized. Login required." });
    }

    const token = authHeader.split(" ")[1];
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { userId: token_decoded.userId };
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authUser