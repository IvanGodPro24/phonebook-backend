import { Router } from 'express';
import contactsRouter from '../routes/contacts.js';
import authRouter from '../routes/auth.js';

const router = Router();

router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);

export default router;
