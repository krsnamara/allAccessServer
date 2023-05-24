const express = ('express');
const imagesRouter = express.Router();
// import { uploadFile, deleteFile, getObjectSignedUrl } from './s3.js'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

imagesRouter.get("/", async (req, res) => {
  const posts = await prisma.posts.findMany({orderBy: [{ created: 'desc'}]})
  res.send(posts)
})


imagesRouter.post('/', upload.single('image'), async (req, res) => {
    console.log('req.body', req.body)
    console.log('req.file', req.file)
  res.send({})
})

imagesRouter.delete("/:id", async (req, res) => {
  const id = +req.params.id

  res.send({})
})