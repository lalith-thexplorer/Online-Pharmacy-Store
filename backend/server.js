// backend/server.js
const http = require('http');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const JWT_SECRET = 'your_jwt_secret';
const PORT = 5000;

let dbClient;
async function getDb() {
  if (!dbClient) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    dbClient = client.db('pharmacy');
  }
  return dbClient;
}

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const { pathname } = url.parse(req.url, true);

  // Decode JWT if present
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.error('JWT error', e);
    }
  }

  // POST /api/signup
  if (req.method === 'POST' && pathname === '/api/signup') {
    let body = '';
    req.on('data', chunk => body += chunk);
    return req.on('end', async () => {
      try {
        const { email, password, name, address } = JSON.parse(body);
        const db = await getDb();
        if (await db.collection('users').findOne({ email })) {
          res.writeHead(400, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ error:'User already exists' }));
        }
        const hash = await bcrypt.hash(password, 10);
        const result = await db.collection('users').insertOne({ email, passwordHash:hash,name,address,role:'user' });
        const token = jwt.sign({
          userId: result.insertedId,
          role: 'user',
          email,
          name,
          address
        }, JWT_SECRET);
                res.writeHead(201, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ token }));
      } catch (e) {
        console.error(e);
        res.writeHead(400, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error:'Bad Request' }));
      }
    });
  }

  // POST /api/login
  if (req.method === 'POST' && pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    return req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        const db = await getDb();
        const rec = await db.collection('users').findOne({ email });
        if (!rec || !(await bcrypt.compare(password, rec.passwordHash))) {
          res.writeHead(401, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ error:'Invalid credentials' }));
        }
        const token = jwt.sign({
          userId: rec._id,
          role: rec.role,
          email: rec.email,
          name: rec.name,
          address: rec.address
        }, JWT_SECRET);        
        res.writeHead(200, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ token, role:rec.role }));
      } catch (e) {
        console.error(e);
        res.writeHead(400, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error:'Bad Request' }));
      }
    });
  }

  // GET /api/products (public)
  if (req.method === 'GET' && pathname === '/api/products') {
    try {
      const db = await getDb();
      const products = await db.collection('products').find().toArray();
      res.writeHead(200, {'Content-Type':'application/json'});
      return res.end(JSON.stringify(products));
    } catch (e) {
      console.error(e);
      res.writeHead(500, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ error:'Internal Server Error' }));
    }
  }

  // Admin product management
  // GET /api/admin/products
  if (req.method === 'GET' && pathname === '/api/admin/products') {
    if (!user || user.role !== 'admin') {
      res.writeHead(403, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ error:'Forbidden' }));
    }
    try {
      const db = await getDb();
      const products = await db.collection('products').find().toArray();
      res.writeHead(200, {'Content-Type':'application/json'});
      return res.end(JSON.stringify(products));
    } catch (e) {
      console.error(e);
      res.writeHead(500, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ error:'Internal Server Error' }));
    }
  }

  // POST /api/admin/products
  if (req.method === 'POST' && pathname === '/api/admin/products') {
    if (!user || user.role !== 'admin') {
      res.writeHead(403, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ error:'Forbidden' }));
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    return req.on('end', async () => {
      try {
        const { name, price, imageUrl, stock } = JSON.parse(body);
        const db = await getDb();
        const result = await db.collection('products').insertOne({ name, price, imageUrl, stock: stock || 0 });
        res.writeHead(201, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ productId: result.insertedId }));
      } catch (e) {
        console.error(e);
        res.writeHead(400, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error:'Bad Request' }));
      }
    });
  }

  // PUT /api/admin/products/:id
  if (req.method === 'PUT') {
    let match = pathname.match(/^\/api\/admin\/products\/([0-9a-fA-F]{24})$/);
    if (match) {
      if (!user || user.role !== 'admin') {
        res.writeHead(403, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error:'Forbidden' }));
      }
      const prodId = match[1];
      let body = '';
      req.on('data', chunk => body += chunk);
      return req.on('end', async () => {
        try {
          const updates = JSON.parse(body);
          const db = await getDb();
          const result = await db.collection('products').updateOne(
            { _id: new ObjectId(prodId) },
            { $set: updates }
          );
          if (!result.matchedCount) {
            res.writeHead(404, {'Content-Type':'application/json'});
            return res.end(JSON.stringify({ error:'Product not found' }));
          }
          res.writeHead(200, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ success:true }));
        } catch (e) {
          console.error(e);
          res.writeHead(400, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ error:'Bad Request' }));
        }
      });
    }
  }

  if (req.method === 'DELETE') {
    let match = pathname.match(/^\/api\/admin\/products\/([0-9a-fA-F]{24})$/);
    if (match) {
      if (!user || user.role !== 'admin') {
        res.writeHead(403, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error: 'Forbidden' }));
      }
      const prodId = match[1];
      try {
        const db = await getDb();
        const result = await db.collection('products').deleteOne({ _id: new ObjectId(prodId) });
        if (!result.deletedCount) {
          res.writeHead(404, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ error: 'Product not found' }));
        }
        res.writeHead(200, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ success: true }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }
  }
  

  // POST /api/orders (authenticated)
  if (req.method === 'POST' && pathname === '/api/orders') {
    if (!user) {
      res.writeHead(401, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ error:'Unauthorized' }));
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    return req.on('end', async () => {
      try {
        const { items } = JSON.parse(body);
        const db = await getDb();
        const result = await db.collection('orders').insertOne({
          userId: new ObjectId(user.userId),
          items,
          status:'pending',
          createdAt: new Date()
        });
        res.writeHead(201, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ orderId: result.insertedId }));
      } catch (e) {
        console.error(e);
        res.writeHead(400, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error:'Bad Request' }));
      }
    });
  }

  // GET /api/orders (authenticated)
  // GET /api/orders
if (req.method === 'GET' && pathname === '/api/orders') {
  if (!user) {
    res.writeHead(401, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ error:'Unauthorized' }));
  }
  try {
    const db = await getDb();
    let orders;
    if (user.role === 'admin') {
      orders = await db.collection('orders')
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $unwind: {
            path: '$userInfo',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray();
        } else {
      orders = await db.collection('orders')
        .find({ userId: new ObjectId(user.userId) })
        .sort({ createdAt:-1 })
        .toArray();
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify(orders));
  } catch (e) {
    console.error(e);
    res.writeHead(500, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ error:'Internal Server Error' }));
  }
}


  // PUT /api/orders/:id (admin only)
  if (req.method === 'PUT') {
    let match = pathname.match(/^\/api\/orders\/([0-9a-fA-F]{24})$/);
    if (match) {
      if (!user || user.role !== 'admin') {
        res.writeHead(403, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ error:'Forbidden' }));
      }
      const orderId = match[1];
      let body = '';
      req.on('data', chunk => body += chunk);
      return req.on('end', async () => {
        try {
          const { status } = JSON.parse(body);
          const db = await getDb();
          const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status } }
          );
          if (!result.matchedCount) {
            res.writeHead(404, {'Content-Type':'application/json'});
            return res.end(JSON.stringify({ error:'Order not found' }));
          }
          res.writeHead(200, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ success:true }));
        } catch (e) {
          console.error(e);
          res.writeHead(400, {'Content-Type':'application/json'});
          return res.end(JSON.stringify({ error:'Bad Request' }));
        }
      });
    }
  }

  // Fallback 404
  res.writeHead(404, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ error:'Not Found' }));
}

http.createServer(handler).listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
