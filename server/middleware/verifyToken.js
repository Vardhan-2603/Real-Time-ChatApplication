import jwt from "jsonwebtoken";

export const verifyToken = (
  req,
  res,
  next,
) => {

  try {

    const token =
      req.cookies.token;

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
