import express from 'express'

import {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
    getBrandBySlug,
} from '../controllers/brandController.js'
import { protect } from './../middleware/authMiddleware.js'


const router = express.Router() 

router.route('/').post(createBrand).get(getBrands)

router
    .route('/:id')
    .get(getBrandById)
    .put(protect, updateBrand)
    .delete(deleteBrand)

router.route('/:id/status').put(updateBrandStatus)

router.get('/slug/:slug', getBrandBySlug)

export default router
