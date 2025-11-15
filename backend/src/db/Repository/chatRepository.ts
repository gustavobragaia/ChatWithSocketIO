import { prisma } from '../client.js'

//verify if room exists. if now, create it
export async function ensureRoomExists(roomId: string) {
    //insert or update
    await prisma.room.upsert({
        where: {id: roomId},
        update: {},
        create: {id: roomId}
    })
}

//create a message 
export async function createMessage(params: {content: string, roomId: string, senderId: string}) {
    const {content, roomId, senderId} = params

    return prisma.message.create({
        data: {
            roomId,
            content,
            userId: senderId,
        }
    })
}

//return the last N messages of room
export async function getLastMessages(params: {roomId: string, limit?: number}){
    const {roomId, limit = 50} = params

    const messages = await prisma.message.findMany({
        where: {roomId},
        orderBy: {createdAt: 'desc'},
        take: limit,
    })

    return messages.reverse()
}
