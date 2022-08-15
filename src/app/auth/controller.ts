import { Request, Response, NextFunction } from 'express';
import db from '../../data/users.json';
import argon from 'argon2';
import fs from 'fs/promises';
import path from 'path';

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

      await fs.writeFile(
        path.join(__dirname, '..', '..', 'data', 'users.json'),
        JSON.stringify(setUser)
      );

      return res.status(200).json({ message: 'register success' });
    } catch (error) {
      return next(error);
    }
  }
}

export default Auth;
