import { Request, Response, NextFunction } from 'express';
import db from '../../data/users.json';
import argon from 'argon2';
import jwt from 'jsonwebtoken';
import config from '../config';
import { createFile } from '../../utils/createFile';
interface payloadType {
  email: string;
  password: string;
}

class Auth {
  async register(req: Request, res: Response, next: NextFunction) {
    const payload = req.body as payloadType;

    if (payload.email.length < 1 || payload.password.length < 1) {
      return res.status(400).json({ message: 'email or password required' });
    }
    const user = db.filter((item) => item.email === payload.email);
    if (user.length)
      return res.status(409).json({ message: 'email already exist' });

    try {
      const encrypt = await argon.hash(payload.password);
      const newUser = { ...payload, password: encrypt };
      const setUser = [...db, newUser];

      await createFile(setUser);

      return res.status(200).json({ message: 'register success' });
    } catch (error) {
      return next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    const payload = req.body as payloadType;

    if (payload.email.length < 1 || payload.password.length < 1) {
      return res.status(400).json({ message: 'email or password required' });
    }

    const user = db.filter((item) => item.email === payload.email);
    if (user.length < 1)
      return res.status(404).json({ message: 'email or password wrong' });

    try {
      const pwdMatch = await argon.verify(user[0].password, payload.password);
      if (!pwdMatch)
        return res.status(404).json({ message: 'email or password wrong' });

      const accessToken = jwt.sign(
        { email: payload.email },
        config.accessKey as string,
        { expiresIn: '30s' }
      );
      const refreshToken = jwt.sign(
        { email: payload.email },
        config.refreshKey as string,
        { expiresIn: '1d' }
      );

      const otherUser = db.filter((item) => item.email !== payload.email);
      const currentUser = { ...user[0], refreshToken };
      const setUser = [...otherUser, currentUser];

      const oneDay = 24 * 60 * 60 * 1000;

      await createFile(setUser);
      res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: oneDay });
      return res.status(200).json({ token: accessToken });
    } catch (error) {
      return next(error);
    }
  }
}

export default Auth;