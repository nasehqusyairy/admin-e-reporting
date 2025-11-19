import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

export function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export function verifyPassword(
    password: string,
    hash: string
) {
    return bcrypt.compare(password, hash);
}

export function createToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    });
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as {
        userId: string;
    };
}
