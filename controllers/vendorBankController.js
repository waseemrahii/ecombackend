import VendorBank from '../models/vendorBankModel.js'
import { createOne, deleteOne, getAll, getOne } from './handleFactory.js'

// Create a new vendor
export const createVendorBank = createOne(VendorBank)

// Get all vendors
export const getAllVendorBanks = getAll(VendorBank)

// Get vendor by ID
export const getVendorBankById = getOne(VendorBank)

// Delete vendor by ID
export const deleteVendorBank = deleteOne(VendorBank)
