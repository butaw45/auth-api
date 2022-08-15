import { Router } from 'express';
import controller from './controller';

const router = Router();
const authController = new controller();

router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/login', authController.login);

export default router;
