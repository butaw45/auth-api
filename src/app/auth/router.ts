import { Router } from 'express';
import controller from './controller';

const router = Router();
const authController = new controller();

router.post('/register', authController.register);

export default router;
