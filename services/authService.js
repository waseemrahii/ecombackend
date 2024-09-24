import jwt from 'jsonwebtoken'
import config from '../config/index.js'

import { setRefreshToken } from './redisService.js'

async function generateRefreshToken(userId, role) {
    const refreshToken = jwt.sign({ userId, role }, config.refreshSecret, {
        expiresIn: config.refreshTokenExpiresIn,
    })
    setRefreshToken(userId, refreshToken)
    return refreshToken
}

function generateAccessToken(userId, role) {
    return jwt.sign({ userId, role }, config.jwtSecret, {
        expiresIn: config.jwtAccessTime,
    })
}

export async function loginService(user) {
    const accessToken = generateAccessToken(user._id, user.role)

    // Store refreshToken in our Redis Caches
    generateRefreshToken(user._id, user.role)

    return { accessToken }
}
