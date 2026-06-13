import {Router} from 'express'
import * as authController from './auth.controller'
import { registerValidator, loginValidator } from './auth.validator';
import validate from '../../middlewares/validate.middleware'

const router = Router()


router.post('/register',registerValidator,validate,authController.register )
router.post('/login',loginValidator, validate, authController.login)

export default router;