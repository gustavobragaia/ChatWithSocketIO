import express from "express"
import jwt from "jsonwebtoken"
import {prisma} from "../db/client"

export const AuthRouter = express.Router()

AuthRouter.post("/register", async (req, res)=>{
    const {email, password, nickname} = req.body

    if (!email || !password || !nickname){
        return res
            .status(400)
            .json({error: "Fill all fields"})
    }

    //verify if prisma find the typed email
    const emailAlreadyExist = await prisma.user.findUnique({
        where: {email}
    })

    if(emailAlreadyExist){
        return res
            .status(409)
            .json({error: "This email already used"})
    }

    const newUser = await prisma.user.create({
        data: {
            email,
            password,
            nickname,
        }
    })

    //generate token after create an user to login in one flux
    const token = jwt.sign(
        {
        userId: newUser.id,
        nickname: newUser.nickname
        },
        process.env.JWT_SECRET as string,
        {expiresIn: "3600s"}
    )

    return res
        .json({
            message: "Sucess in register this user",
            token,
            user: {
                email,
                password,
                nickname
            }
        })
})

AuthRouter.post("/login", async (req, res)=> {
    const {email, password} = req.body

    fetch("http://localhost:3000/auth/login", {
        method: "POST",
        body: JSON.stringify({email, password})
    })

    if(!email || !password){
        return res
            .status(400)
            .json({error: "Type an email or password"})
    }

    //search the user with email
    const user = await prisma.user.findUnique({
        where: {email}
    })

    if(!user){
        return res
            .status(401)
            .json({error: "User not found"})
    }

    if(user.password !== password){
        return res
            .status(401)
            .json({error: "Invalid password"})
    }

    //generate the jwt token valid for 3600s (1hour)
    const token = jwt.sign(
        {
        userId: user.id,
        nickname: user.nickname
        },
        process.env.JWT_SECRET as string,
        {expiresIn: "3600s"}
    )  

    return res.json(
        {
            token,
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                password: user.password
            }
        }
    )
})