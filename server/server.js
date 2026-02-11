require('dotenv').config()

const mongoose = require('mongoose')
const Document = require("./Document")
//documentation for mongoose
mongoose.connect(process.env.MONGO_URI)



const PORT = process.env.PORT || 3001
const io = require('socket.io')(PORT, {
        cors : {
            origin : "*",
            methods : ["GET", "POST"],
        },
})

const defaultValue = ""
io.on("connection", socket => {
    socket.on('get-document', async documentId =>{
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document', document.data)
        socket.on('send-changes', delta =>{
        //broadcast the message to everyone else except me, delta are those changes
        socket.broadcast.to(documentId).emit("receive-changes", delta)
        })
    
    socket.on("save-document", async data =>{
        await Document.findByIdAndUpdate(documentId, { data }) //we already have our document, we just need to update our data

    })
})

})

//whenever i get a document on line 20, we either find a document or create a new one
//so we will create a function to do that
async function findOrCreateDocument(id){

    if(id == null) return

    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({_id : id, data: defaultValue})

}