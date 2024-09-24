import express from 'express'
import {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUser,
} from './../controllers/userController.js'
import {
    login,
    signup,
    logout,
    updatePassword,
} from '../controllers/authController.js'
import {
    protect,
    restrictTo,
    selectModelByRole,
} from '../middleware/authMiddleware.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import userValidationSchema from './../validations/userValidator.js'
import { loginLimiter } from '../utils/helpers.js'

const router = express.Router()

router.post('/login', loginLimiter, login)
router.post('/register', signup)
router.post('/logout', protect, logout)

router.put('/update-password', protect, selectModelByRole, updatePassword)

router
    .route('/')
    .post(
        protect,
        restrictTo('admin'),
        // validateSchema(userValidationSchema),
        createUser
    )
    .get(protect, restrictTo('admin'), getUsers)

router
    .route('/:id')
    .get(protect, getUser)
    .delete(protect, restrictTo('admin'), deleteUser)
    .put(protect, updateUser)

export default router
