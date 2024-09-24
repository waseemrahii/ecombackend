import dotenv from 'dotenv'

dotenv.config()

const config = {
    port: process.env.PORT || 3000,
    dbURI: process.env.DB_URI,
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_SECRET,
    jwtAccessTime: process.env.JWT_ACCESS_TIME,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TIME,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TIME,
    redisUrl: process.env.REDIS_URL,
}

export default config
