const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const OrbitDB = require('orbit-db')

//Confirm IPFS server swarm
const ipfs = new IPFS({
  repo: repo(),
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
})

ipfs.on('ready', async () => {
  // Create a database
  const orbitdb = new OrbitDB(ipfs)
  const access = {
    // Give write access to everyone
    write: ['*'],
  }
  const db = await orbitdb.keyvalue('main-database', access)
  console.log(db.address.toString())
  await db.load()
  await db.put('name1', 'hello1')
  const value = db.get('name2')
  const value1 = db.get('name1')
  console.log('print', value, value1)
  // const db = await orbitdb.log('database init')
  //==========================================
  // Create / Open a database
  // const db = await orbitdb.log('hello')
  // await db.load()

  // // Listen for updates from peers
  // db.events.on('replicated', (address) => {
  //   console.log('replicated', db.iterator({ limit: -1 }).collect())
  // })

  // // Add an entry
  // const hash = await db.add('world')
  // console.log(hash)
  
  // // Query
  // const result = db.iterator({ limit: -1 }).collect()
  // console.log('results',result)
  // await db.set('hello', { name: 'Friend' })
})

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }
  console.log('IPFS node ready with address ' + info.id)

  //Room name
  const room = Room(ipfs, 'ipfs-efin-dex')

  room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
  room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))

  // send and receive messages
  var tempObject = [
    {
      name: 'alberto',
      lastname: 'cerrato'
    }
  ];

  room.on('peer joined', (peer) => room.sendTo(peer, tempObject))
  room.on('message', (message) => logme(message))

  // broadcast message every 2 seconds

//   setInterval(() => room.broadcast('hey everyone!'), 2000)
}))

function repo () {
  return 'ipfs/pubsub-demo/' + Math.random()
}

function logme (data) {
  console.log(data);
}