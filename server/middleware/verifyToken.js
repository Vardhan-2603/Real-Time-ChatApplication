import jwt from "jsonwebtoken";

export const verifyToken = (
  req,
  res,
  next,
) => {

  try {

    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      token = parts[0] === "Bearer" ? parts[1] : req.headers.authorization;
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET,
      );

    req.user = {

      userId:
        decoded.userId,

      email:
        decoded.email,

    };

    next();

  } catch (err) {

    console.log(err);

    return res.status(401).json({
      error: "Invalid token",
    });

  }

};
