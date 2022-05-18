
const express = require('express');
const redis = require('redis')
const util = require('util')
const axios = require('axios')

//here we interact with redis
//const redisUrl = "redis://127.0.0.1:6379"
const client = redis.createClient()
client.connect()

const app = express();
app.use(express.json())

app.post('/', async (req, res) => {

    const { key, value } = req.body
    //await client.del(key)
    //set data to the edish
    const response = await client.set(key, value)
    res.json(response)
})

app.get('/', async (req, res) => {
    const { key } = req.body
    //here we get the key valu from the redis
    const value = await client.get(key)
    res.json(value)
})

//get data from free url
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    //get data from redis
    const cachedPost = await client.get(`post-${id}`)//here 'post-${id} is the key name
    if (cachedPost) {
        return res.json(JSON.parse(cachedPost))
    }
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
    //set to redis and after 10sec it will expair from redish
    client.set(`post-${id}`, JSON.stringify(response.data),"EX",5)

    return res.json(response.data)
})

app.listen(8080, async () => {
    console.log('My server run on the port 8080!!');
})


