import express from 'express';
import { someController } from '../controllers/index';

const router = express.Router();

router.get('/some-route', someController.someMethod);

export default router;