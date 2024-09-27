import express from 'express';
import Controller from '../controllers/ocrController';

const controller = new Controller()

const router = express.Router();

router.post('/postAadhar')

export default router;