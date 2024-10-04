import VendorBank from '../models/vendorBankModel.js'
import Vendor from '../models/vendorModel.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './handleFactory.js'

// Create a new vendor
export const createVendorBank = createOne(VendorBank)

// Get all vendors
export const getAllVendorBanks = getAll(VendorBank)

// Get vendor by ID
export const getVendorBankById = getOne(VendorBank)

// Delete vendor by ID
export const deleteVendorBank = deleteOne(VendorBank)

export const updateVendorBank = updateOne(VendorBank)
