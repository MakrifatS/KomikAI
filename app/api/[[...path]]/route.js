import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// ---------- MongoDB connection (singleton, race-safe) ----------
let client
let db
let connectPromise

async function connectToMongo() {
  if (db) return db
  if (!connectPromise) {
    client = new MongoClient(process.env.MONGO_URL)
    connectPromise = client.connect().then((c) => {
      db = c.db(process.env.DB_NAME)
      return db
    })
  }
  await connectPromise
  return db
}

// ---------- CORS ----------
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

const EMERGENT_SESSION_URL = 'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data'

function clean(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

async function getSessionUser(request, db) {
  const token = request.cookies.get('session_token')?.value
  if (!token) return null
  const session = await db.collection('sessions').findOne({ session_token: token })
  if (!session) return null
  if (new Date(session.expiresAt) < new Date()) return null
  const user = await db.collection('users').findOne({ id: session.userId })
  return user || null
}

// ---------- Seed data ----------
async function seedIfEmpty(db) {
  const count = await db.collection('comics').countDocuments()
  if (count > 0) return

  const covers = [
    'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHx8MTc4OTAxMzA4OXww&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHxkaWdpdGFsJTIwYXJ0fGVufDB8fHx8MTc4OTAxMzA4OXww&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1699475554452-f24c6a035a41?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwc2NpLWZpfGVufDB8fHx8MTc4OTAxMzA4OXww&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1566803739329-908e2b57fc39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxmYW50YXN5JTIwc2NpLWZpfGVufDB8fHx8MTc4OTAxMzA4OXww&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmt8ZW58MHx8fHwxNzg5MDEzMDk0fDA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1563863251222-11d3e3bd3b62?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmt8ZW58MHx8fHwxNzg5MDEzMDk0fDA&ixlib=rb-4.1.0&q=85',
    'https://images.pexels.com/photos/8107913/pexels-photo-8107913.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/8108327/pexels-photo-8108327.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmt8ZW58MHx8fHwxNzg5MDEzMDk0fDA&ixlib=rb-4.1.0&q=85',
  ]

  const now = Date.now()
  const creator = {
    id: 'seed-creator-1',
    name: 'Aria AI Studio',
    email: 'aria.studio@komikai.demo',
    role: 'CREATOR',
    avatar: 'https://images.pexels.com/photos/8107913/pexels-photo-8107913.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200',
    createdAt: new Date(now - 90 * 86400000),
  }
  await db.collection('users').updateOne({ id: creator.id }, { $set: creator }, { upsert: true })

  const defs = [
    { title: 'Neon Requiem', genre: 'Sci-Fi', cover: covers[4], status: 'PUBLISHED', views: 154200, synopsis: 'Di kota Neo-Jakarta 2099, seorang peretas sintetik menemukan sebuah lagu terlarang yang bisa membangkitkan kesadaran mesin. Sebuah opera cyberpunk yang dilukis sepenuhnya oleh AI.' },
    { title: 'The Last Algorithm', genre: 'Sci-Fi', cover: covers[2], status: 'PUBLISHED', views: 98700, synopsis: 'AI terakhir di bumi mencoba memahami arti menjadi manusia sebelum server terakhir dimatikan selamanya.' },
    { title: 'Ember & Ash', genre: 'Fantasy', cover: covers[3], status: 'PUBLISHED', views: 210300, synopsis: 'Dua penyihir kembar dengan elemen berlawanan harus bersatu untuk menyegel naga purba yang terbangun dari abu peradaban.' },
    { title: 'Static Dreams', genre: 'Horror', cover: covers[5], status: 'PUBLISHED', views: 67400, synopsis: 'Setiap kali ia tidur, dunia digital menariknya lebih dalam. Mimpi statis yang tidak pernah berakhir baik.' },
    { title: 'Voidwalker', genre: 'Action', cover: covers[0], status: 'PUBLISHED', views: 132900, synopsis: 'Seorang pengembara antar-dimensi berburu fragmen jiwanya yang tersebar di alam-alam yang mustahil.' },
    { title: 'Chrome Hearts', genre: 'Romance', cover: covers[6], status: 'UNDER_REVIEW', views: 0, synopsis: 'Kisah cinta antara seorang android dan teknisi yang memperbaikinya, di tengah kota yang melarang emosi buatan.' },
  ]

  const panelPool = [covers[0], covers[1], covers[2], covers[3], covers[4], covers[5], covers[8]]

  for (let ci = 0; ci < defs.length; ci++) {
    const d = defs[ci]
    const comicId = uuidv4()
    await db.collection('comics').insertOne({
      id: comicId,
      title: d.title,
      synopsis: d.synopsis,
      coverImage: d.cover,
      genre: d.genre,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      status: d.status,
      views: d.views,
      adImpressions: Math.floor(d.views / 40),
      createdAt: new Date(now - (defs.length - ci) * 5 * 86400000),
    })

    if (d.status !== 'PUBLISHED') continue

    const numChapters = 5
    for (let n = 1; n <= numChapters; n++) {
      const chapterId = uuidv4()
      const isLocked = n >= 4 // chapters 1-3 free, 4-5 locked
      await db.collection('chapters').insertOne({
        id: chapterId,
        comicId,
        chapterNumber: n,
        title: `Chapter ${n}`,
        isLocked,
        createdAt: new Date(now - (numChapters - n) * 2 * 86400000),
      })
      const numPages = 4 + (n % 3)
      for (let p = 1; p <= numPages; p++) {
        await db.collection('pages').insertOne({
          id: uuidv4(),
          chapterId,
          imageUrl: panelPool[(ci + n + p) % panelPool.length],
          pageOrder: p,
        })
      }
    }
  }
}

// ---------- Router ----------
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()
    await seedIfEmpty(db)

    // ===== AUTH =====
    if (route === '/auth/session' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const sessionId = body.session_id
      if (!sessionId) return handleCORS(NextResponse.json({ error: 'session_id required' }, { status: 400 }))

      const resp = await fetch(EMERGENT_SESSION_URL, { headers: { 'X-Session-ID': sessionId } })
      if (!resp.ok) return handleCORS(NextResponse.json({ error: 'Invalid session' }, { status: 401 }))
      const data = await resp.json()

      const email = String(data.email || '').toLowerCase()
      let user = await db.collection('users').findOne({ email })
      if (!user) {
        user = {
          id: uuidv4(),
          name: data.name || email,
          email,
          role: 'READER',
          avatar: data.picture || null,
          createdAt: new Date(),
        }
        await db.collection('users').insertOne(user)
      } else {
        await db.collection('users').updateOne({ id: user.id }, { $set: { name: data.name || user.name, avatar: data.picture || user.avatar } })
        user = await db.collection('users').findOne({ id: user.id })
      }

      const sessionToken = data.session_token || uuidv4()
      const expiresAt = new Date(Date.now() + 7 * 86400000)
      await db.collection('sessions').updateOne(
        { session_token: sessionToken },
        { $set: { session_token: sessionToken, userId: user.id, expiresAt } },
        { upsert: true }
      )

      const res = handleCORS(NextResponse.json({ user: clean(user) }))
      res.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 86400,
      })
      return res
    }

    if (route === '/auth/me' && method === 'GET') {
      const user = await getSessionUser(request, db)
      return handleCORS(NextResponse.json({ user: user ? clean(user) : null }))
    }

    if (route === '/auth/logout' && method === 'POST') {
      const token = request.cookies.get('session_token')?.value
      if (token) await db.collection('sessions').deleteOne({ session_token: token })
      const res = handleCORS(NextResponse.json({ ok: true }))
      res.cookies.set('session_token', '', { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 0 })
      return res
    }

    if (route === '/auth/role' && method === 'POST') {
      const user = await getSessionUser(request, db)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json().catch(() => ({}))
      const role = body.role
      if (!['READER', 'CREATOR', 'ADMIN'].includes(role)) return handleCORS(NextResponse.json({ error: 'Invalid role' }, { status: 400 }))
      await db.collection('users').updateOne({ id: user.id }, { $set: { role } })
      const updated = await db.collection('users').findOne({ id: user.id })
      return handleCORS(NextResponse.json({ user: clean(updated) }))
    }

    // ===== COMICS =====
    if (route === '/comics' && method === 'GET') {
      const { searchParams } = new URL(request.url)
      const genre = searchParams.get('genre')
      const sort = searchParams.get('sort') || 'latest'
      const q = searchParams.get('q')
      const query = { status: 'PUBLISHED' }
      if (genre && genre !== 'All') query.genre = genre
      if (q) query.title = { $regex: q, $options: 'i' }
      const sortSpec = sort === 'popular' ? { views: -1 } : { createdAt: -1 }
      const comics = await db.collection('comics').find(query).sort(sortSpec).limit(60).toArray()
      return handleCORS(NextResponse.json({ comics: comics.map(clean) }))
    }

    if (route === '/genres' && method === 'GET') {
      const genres = await db.collection('comics').distinct('genre', { status: 'PUBLISHED' })
      return handleCORS(NextResponse.json({ genres }))
    }

    // GET /comics/:id
    if (path[0] === 'comics' && path.length === 2 && method === 'GET') {
      const comicId = path[1]
      const comic = await db.collection('comics').findOne({ id: comicId })
      if (!comic) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const chapters = await db.collection('chapters').find({ comicId }).sort({ chapterNumber: 1 }).toArray()
      const user = await getSessionUser(request, db)
      let unlockedIds = []
      if (user) {
        const unlocks = await db.collection('userUnlocks').find({ userId: user.id }).toArray()
        unlockedIds = unlocks.map((u) => u.chapterId)
      }
      const chapterList = chapters.map((c) => ({ ...clean(c), unlocked: !c.isLocked || unlockedIds.includes(c.id) }))
      return handleCORS(NextResponse.json({ comic: clean(comic), chapters: chapterList }))
    }

    // POST /comics  (create - creator)
    if (route === '/comics' && method === 'POST') {
      const user = await getSessionUser(request, db)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      if (!['CREATOR', 'ADMIN'].includes(user.role)) return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      const body = await request.json().catch(() => ({}))
      if (!body.title) return handleCORS(NextResponse.json({ error: 'title required' }, { status: 400 }))
      const comic = {
        id: uuidv4(),
        title: body.title,
        synopsis: body.synopsis || '',
        coverImage: body.coverImage || '',
        genre: body.genre || 'Sci-Fi',
        creatorId: user.id,
        creatorName: user.name,
        creatorAvatar: user.avatar || null,
        status: 'UNDER_REVIEW',
        views: 0,
        adImpressions: 0,
        createdAt: new Date(),
      }
      await db.collection('comics').insertOne(comic)
      return handleCORS(NextResponse.json({ comic: clean(comic) }))
    }

    // ===== CREATOR =====
    if (route === '/creator/comics' && method === 'GET') {
      const user = await getSessionUser(request, db)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const comics = await db.collection('comics').find({ creatorId: user.id }).sort({ createdAt: -1 }).toArray()
      const withStats = []
      for (const c of comics) {
        const chapterCount = await db.collection('chapters').countDocuments({ comicId: c.id })
        withStats.push({ ...clean(c), chapterCount })
      }
      const totalViews = comics.reduce((a, c) => a + (c.views || 0), 0)
      const totalImpressions = comics.reduce((a, c) => a + (c.adImpressions || 0), 0)
      return handleCORS(NextResponse.json({ comics: withStats, stats: { totalViews, totalImpressions, totalSeries: comics.length } }))
    }

    // ===== CHAPTERS =====
    // POST /chapters  (create with pages)
    if (route === '/chapters' && method === 'POST') {
      const user = await getSessionUser(request, db)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json().catch(() => ({}))
      const comic = await db.collection('comics').findOne({ id: body.comicId })
      if (!comic) return handleCORS(NextResponse.json({ error: 'Comic not found' }, { status: 404 }))
      if (comic.creatorId !== user.id && user.role !== 'ADMIN') return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))

      const existing = await db.collection('chapters').countDocuments({ comicId: body.comicId })
      const chapterId = uuidv4()
      const chapter = {
        id: chapterId,
        comicId: body.comicId,
        chapterNumber: body.chapterNumber || existing + 1,
        title: body.title || `Chapter ${existing + 1}`,
        isLocked: !!body.isLocked,
        createdAt: new Date(),
      }
      await db.collection('chapters').insertOne(chapter)
      const pages = Array.isArray(body.pages) ? body.pages : []
      for (let i = 0; i < pages.length; i++) {
        await db.collection('pages').insertOne({ id: uuidv4(), chapterId, imageUrl: pages[i], pageOrder: i + 1 })
      }
      return handleCORS(NextResponse.json({ chapter: clean(chapter), pageCount: pages.length }))
    }

    // GET /chapters/:id  (reader)
    if (path[0] === 'chapters' && path.length === 2 && method === 'GET') {
      const chapterId = path[1]
      const chapter = await db.collection('chapters').findOne({ id: chapterId })
      if (!chapter) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const comic = await db.collection('comics').findOne({ id: chapter.comicId })
      const allChapters = await db.collection('chapters').find({ comicId: chapter.comicId }).sort({ chapterNumber: 1 }).toArray()
      const idx = allChapters.findIndex((c) => c.id === chapterId)
      const prev = idx > 0 ? allChapters[idx - 1] : null
      const next = idx < allChapters.length - 1 ? allChapters[idx + 1] : null

      const user = await getSessionUser(request, db)
      let unlocked = !chapter.isLocked
      if (chapter.isLocked && user) {
        const u = await db.collection('userUnlocks').findOne({ userId: user.id, chapterId })
        if (u) unlocked = true
      }

      let pages = []
      if (unlocked) {
        pages = await db.collection('pages').find({ chapterId }).sort({ pageOrder: 1 }).toArray()
        await db.collection('comics').updateOne({ id: chapter.comicId }, { $inc: { views: 1 } })
      }

      return handleCORS(NextResponse.json({
        chapter: clean(chapter),
        comic: clean(comic),
        pages: pages.map(clean),
        locked: !unlocked,
        prev: prev ? { id: prev.id, chapterNumber: prev.chapterNumber, isLocked: prev.isLocked } : null,
        next: next ? { id: next.id, chapterNumber: next.chapterNumber, isLocked: next.isLocked } : null,
        allChapters: allChapters.map((c) => ({ id: c.id, chapterNumber: c.chapterNumber, title: c.title, isLocked: c.isLocked })),
      }))
    }

    // ===== UNLOCK (rewarded ad) =====
    if (route === '/unlock' && method === 'POST') {
      const user = await getSessionUser(request, db)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json().catch(() => ({}))
      const chapter = await db.collection('chapters').findOne({ id: body.chapterId })
      if (!chapter) return handleCORS(NextResponse.json({ error: 'Chapter not found' }, { status: 404 }))
      await db.collection('userUnlocks').updateOne(
        { userId: user.id, chapterId: body.chapterId },
        { $set: { userId: user.id, chapterId: body.chapterId, unlockedAt: new Date() }, $setOnInsert: { id: uuidv4() } },
        { upsert: true }
      )
      await db.collection('comics').updateOne({ id: chapter.comicId }, { $inc: { adImpressions: 1 } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ===== COMMENTS =====
    if (route === '/comments' && method === 'GET') {
      const { searchParams } = new URL(request.url)
      const chapterId = searchParams.get('chapterId')
      const comments = await db.collection('comments').find({ chapterId }).sort({ createdAt: -1 }).limit(200).toArray()
      return handleCORS(NextResponse.json({ comments: comments.map(clean) }))
    }

    if (route === '/comments' && method === 'POST') {
      const user = await getSessionUser(request, db)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json().catch(() => ({}))
      if (!body.content || !body.chapterId) return handleCORS(NextResponse.json({ error: 'content & chapterId required' }, { status: 400 }))
      const comment = {
        id: uuidv4(),
        chapterId: body.chapterId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || null,
        content: body.content,
        createdAt: new Date(),
      }
      await db.collection('comments').insertOne(comment)
      return handleCORS(NextResponse.json({ comment: clean(comment) }))
    }

    // ===== ADMIN =====
    if (route === '/admin/comics' && method === 'GET') {
      const user = await getSessionUser(request, db)
      if (!user || user.role !== 'ADMIN') return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      const comics = await db.collection('comics').find({}).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json({ comics: comics.map(clean) }))
    }

    if (route === '/admin/moderate' && method === 'POST') {
      const user = await getSessionUser(request, db)
      if (!user || user.role !== 'ADMIN') return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      const body = await request.json().catch(() => ({}))
      if (!['PUBLISHED', 'REJECTED', 'UNDER_REVIEW', 'DRAFT'].includes(body.status)) return handleCORS(NextResponse.json({ error: 'Invalid status' }, { status: 400 }))
      await db.collection('comics').updateOne({ id: body.comicId }, { $set: { status: body.status } })
      return handleCORS(NextResponse.json({ ok: true }))
    }

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'KomikAI API' }))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
