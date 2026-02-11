// import { useEffect, useRef } from 'react'
// import Quill from "quill"
// import "quill/dist/quill.snow.css"

// export default function TextEditor() {
//     const wrapperRef = useRef()
//     const quillRef = useRef()

//     useEffect(() => {
//         if (quillRef.current) return

//         const editor = document.createElement('div')
//         wrapperRef.current.append(editor)

//         quillRef.current = new Quill(editor, { theme: "snow"})

//         return () => {
//             wrapped.innerHTML = ""
//         }
//     }, [])
//   return <div ref = {wrapperRef}></div>
  
// }



import { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
    [{header : [1, 2, 3, 4, 5, 6, false]}],
    [{ font : []}],
    [{ list : "ordered" }, { list: "bullet"}],
    ["bold", "italic", "underline"],
    [{color : []}, { background : []}],
    [{script : "sub"}, {script : "super"}],
    [{align: []}],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor() {
    const {id: documentId} = useParams()
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    // console.log(documentId)
    
    
    useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
        quill.setContents(document)
        quill.enable()
    })

    socket.emit('get-document', documentId)
}, [socket, quill, documentId])


    useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
        socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
        clearInterval(interval)
    }
}, [socket, quill])


    useEffect(() => {
       const s = io("http://127.0.0.1:3001")
       setSocket(s)
        return () =>{
            s.disconnect()
        }
    }, [])

    //this use effect is for detecting changes whenever quill changes
    useEffect(() => {
        if(socket == null || quill == null) return //will make sure that our code has socket and quill

        const handler = (delta) => {
           quill.updateContents(delta) //send that to our server
        }
        socket.on("receive-changes", handler)//whenever qull has text that changes we will send that to our server using  

        return () => {
            socket.off('receive-changes', handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if(socket == null || quill == null) return //will make sure that our code has socket and quill

        const handler = (delta, oldDelta, source) => {
            if(source !== 'user')return 
            socket.emit("send-changes" , delta) //send that to our server
        }
        quill.on('text-change', handler)//whenever qull has text that changes we will send that to our server using  

        return () => {
            quill.off('text-change', handler)
        }

    }, [socket, quill])


    const wrapperRef = useCallback(wrapper => {
        if(wrapper == null)
            return
        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, { theme : "snow", 
            modules : {toolbar : TOOLBAR_OPTIONS}
        })
        q.disable()
        q.setText('Loading...')
         setQuill(q)
    }, [])

    return <div className = "container" ref = {wrapperRef}></div>
     
}