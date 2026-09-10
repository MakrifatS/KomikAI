'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  Lock, Home, Search, LogOut, Plus, Upload, ChevronLeft, ChevronRight,
  MessageCircle, Play, Shield, Flame, Sparkles, Menu, X, Eye, BookOpen,
  Check, Ban, Clock, Trash2, PenSquare, Star, ArrowLeft, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const GENRES = ['All', 'Sci-Fi', 'Fantasy', 'Action', 'Horror', 'Romance', 'Comedy', 'Drama']

const BANNERS = [
  { img: 'https://images.unsplash.com/photo-1573767291321-c0af2eaf5266?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmslMjBjaXR5fGVufDB8fHxibHVlfDE3ODkwMTMxNDF8MA&ixlib=rb-4.1.0&q=85', tag: 'CYBERPUNK', title: 'Neon Requiem', sub: 'Opera cyberpunk yang dilukis sepenuhnya oleh AI' },
  { img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDB8fHx8MTc4OTAxMzE0Nnww&ixlib=rb-4.1.0&q=85', tag: 'FANTASY', title: 'Ember & Ash', sub: 'Dua penyihir kembar melawan naga purba dari abu peradaban' },
  { img: 'https://images.unsplash.com/photo-1537210249814-b9a10a161ae4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxkcmFtYXRpYyUyMHNreXxlbnwwfHx8Ymx1ZXwxNzg5MDEzMTQxfDA&ixlib=rb-4.1.0&q=85', tag: 'SCI-FI', title: 'The Last Algorithm', sub: 'AI terakhir di bumi mencari arti menjadi manusia' },
]

const fmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n || 0)
}

const api = async (path, opts = {}) => {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ---------------- Rewarded Ad Modal ----------------
function AdModal({ open, chapter, onClose, onComplete }) {
  const [count, setCount] = useState(15)
  const [done, setDone] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!open) return
    setCount(15)
    setDone(false)
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(t); setDone(true); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [open])

  const claim = async () => {
    setClaiming(true)
    try {
      await onComplete()
    } finally {
      setClaiming(false)
    }
  }

  const pct = ((15 - count) / 15) * 100

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !claiming) onClose() }}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 overflow-hidden p-0">
        <div className="relative aspect-video bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 flex flex-col items-center justify-center">
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/40 text-white border-0 text-[10px]">IKLAN</Badge>
          </div>
          {!done ? (
            <>
              <Play className="h-12 w-12 text-white/90 mb-2" />
              <p className="text-white/90 text-sm font-medium">Iklan sedang diputar...</p>
              <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-sm font-bold tabular-nums">
                {count}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center mb-2">
                <Check className="h-8 w-8 text-white" />
              </div>
              <p className="text-white font-semibold">Iklan selesai!</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 h-1 bg-white/90 transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-violet-400">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Buka {chapter?.title || 'Chapter'}</span>
          </div>
          <p className="text-sm text-zinc-400">
            Tonton iklan sampai selesai untuk membuka chapter ini secara gratis dan permanen di akun kamu.
          </p>
          <Button
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
            disabled={!done || claiming}
            onClick={claim}
          >
            {claiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : done ? <Sparkles className="h-4 w-4 mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            {claiming ? 'Membuka...' : done ? 'Klaim & Buka Chapter' : `Tunggu ${count} detik...`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------- Comic Card ----------------
function ComicCard({ comic, onClick, rank }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/5">
        <img src={comic.coverImage} alt={comic.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {rank != null && (
          <span className="absolute top-2 left-2 text-3xl font-black text-white drop-shadow-lg italic">{rank}</span>
        )}
        <Badge className="absolute top-2 right-2 bg-violet-600/90 border-0 text-[10px]">{comic.genre}</Badge>
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-[11px] text-zinc-300">
          <Eye className="h-3 w-3" /> {fmt(comic.views)}
        </div>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-100 truncate">{comic.title}</h3>
      <p className="text-xs text-zinc-500 truncate">{comic.creatorName}</p>
    </div>
  )
}

// ---------------- Home View ----------------
function HomeView({ onOpenComic }) {
  const [comics, setComics] = useState([])
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('latest')
  const [q, setQ] = useState('')
  const [bannerIdx, setBannerIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (genre !== 'All') params.set('genre', genre)
      params.set('sort', sort)
      if (q) params.set('q', q)
      const data = await api(`/comics?${params.toString()}`)
      setComics(data.comics)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }, [genre, sort, q])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const popular = [...comics].sort((a, b) => b.views - a.views).slice(0, 6)

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="relative h-[220px] sm:h-[340px] overflow-hidden">
        {BANNERS.map((b, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
            <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 sm:p-10 max-w-2xl">
              <Badge className="bg-violet-600 border-0 mb-3">{b.tag}</Badge>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">{b.title}</h2>
              <p className="text-zinc-300 text-sm sm:text-base mt-2">{b.sub}</p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 right-5 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)} className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Search + genre */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul komik..." className="pl-9 bg-zinc-900 border-zinc-800" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Terbaru</SelectItem>
              <SelectItem value="popular">Terpopuler</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
          {GENRES.map((g) => (
            <button key={g} onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${genre === g ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
              {g}
            </button>
          ))}
        </div>

        {/* Popular */}
        {genre === 'All' && !q && popular.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Flame className="h-5 w-5 text-orange-500" /> Populer Minggu Ini</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {popular.map((c, i) => <ComicCard key={c.id} comic={c} rank={i + 1} onClick={() => onOpenComic(c.id)} />)}
            </div>
          </section>
        )}

        {/* All / filtered */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <Sparkles className="h-5 w-5 text-violet-500" /> {genre === 'All' && !q ? 'Komik AI Terbaru' : 'Hasil'}
          </h2>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl bg-zinc-900 animate-pulse" />)}
            </div>
          ) : comics.length === 0 ? (
            <p className="text-zinc-500 text-sm py-10 text-center">Tidak ada komik ditemukan.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {comics.map((c) => <ComicCard key={c.id} comic={c} onClick={() => onOpenComic(c.id)} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ---------------- Detail View ----------------
function DetailView({ comicId, user, onBack, onRead, onLoginNeeded, refreshKey }) {
  const [comic, setComic] = useState(null)
  const [chapters, setChapters] = useState([])
  const [adChapter, setAdChapter] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await api(`/comics/${comicId}`)
      setComic(data.comic)
      setChapters(data.chapters)
    } catch (e) { toast.error(e.message) }
  }, [comicId])

  useEffect(() => { load() }, [load, refreshKey])

  const handleChapter = (ch) => {
    if (ch.unlocked) { onRead(ch.id); return }
    if (!user) { onLoginNeeded(); return }
    setAdChapter(ch)
  }

  const completeAd = async () => {
    try {
      await api('/unlock', { method: 'POST', body: JSON.stringify({ chapterId: adChapter.id }) })
      toast.success('Chapter berhasil dibuka!')
      const id = adChapter.id
      setAdChapter(null)
      await load()
      onRead(id)
    } catch (e) { toast.error(e.message) }
  }

  if (!comic) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>

  const firstChapter = chapters[0]

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 h-64 overflow-hidden">
          <img src={comic.coverImage} className="w-full h-full object-cover blur-xl scale-110 opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 pt-4">
          <button onClick={onBack} className="flex items-center gap-1 text-zinc-300 hover:text-white text-sm mb-4"><ArrowLeft className="h-4 w-4" /> Kembali</button>
          <div className="flex gap-4 sm:gap-6">
            <img src={comic.coverImage} alt={comic.title} className="w-28 sm:w-44 aspect-[3/4] object-cover rounded-xl ring-1 ring-white/10 shadow-2xl shrink-0" />
            <div className="flex-1 min-w-0">
              <Badge className="bg-violet-600 border-0 mb-2">{comic.genre}</Badge>
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">{comic.title}</h1>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-7 w-7"><AvatarImage src={comic.creatorAvatar} /><AvatarFallback>{comic.creatorName?.[0]}</AvatarFallback></Avatar>
                <span className="text-sm text-zinc-300">{comic.creatorName}</span>
                <Badge variant="outline" className="border-violet-500/50 text-violet-300 text-[10px] gap-1"><Sparkles className="h-3 w-3" /> AI Creator</Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-zinc-400">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {fmt(comic.views)}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {chapters.length} Chapter</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mt-5">{comic.synopsis}</p>
          {firstChapter && (
            <Button onClick={() => handleChapter(firstChapter)} className="mt-5 bg-violet-600 hover:bg-violet-500 gap-2">
              <BookOpen className="h-4 w-4" /> Baca dari Awal
            </Button>
          )}
        </div>
      </div>

      {/* Chapter list */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-bold text-white mb-3">Daftar Chapter</h2>
        <div className="space-y-2">
          {chapters.map((ch) => (
            <button key={ch.id} onClick={() => handleChapter(ch)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition text-left ring-1 ring-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-200">Ch. {ch.chapterNumber}</span>
                <span className="text-sm text-zinc-400">{ch.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">{new Date(ch.createdAt).toLocaleDateString('id-ID')}</span>
                {ch.unlocked ? (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">Gratis</Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px] gap-1"><Lock className="h-3 w-3" /> Iklan</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <AdModal open={!!adChapter} chapter={adChapter} onClose={() => setAdChapter(null)} onComplete={completeAd} />
    </div>
  )
}

// ---------------- Reader View ----------------
function ReaderView({ chapterId, user, onBack, onOpenChapter, onLoginNeeded }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adChapter, setAdChapter] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showBar, setShowBar] = useState(true)
  const lastScroll = useRef(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await api(`/chapters/${chapterId}`)
      setData(d)
      if (!d.locked) {
        const c = await api(`/comments?chapterId=${chapterId}`)
        setComments(c.comments)
      }
      window.scrollTo(0, 0)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }, [chapterId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setShowBar(y < lastScroll.current || y < 100)
      lastScroll.current = y
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goChapter = (target) => {
    if (!target) return
    if (target.isLocked) {
      if (!user) { onLoginNeeded(); return }
      setAdChapter(target)
    } else {
      onOpenChapter(target.id)
    }
  }

  const completeAd = async () => {
    try {
      await api('/unlock', { method: 'POST', body: JSON.stringify({ chapterId: adChapter.id }) })
      toast.success('Chapter dibuka!')
      const id = adChapter.id
      setAdChapter(null)
      onOpenChapter(id)
    } catch (e) { toast.error(e.message) }
  }

  const postComment = async () => {
    if (!user) { onLoginNeeded(); return }
    if (!newComment.trim()) return
    try {
      const d = await api('/comments', { method: 'POST', body: JSON.stringify({ chapterId, content: newComment.trim() }) })
      setComments([d.comment, ...comments])
      setNewComment('')
    } catch (e) { toast.error(e.message) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>
  if (!data) return null

  // Locked screen
  if (data.locked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-amber-500/15 flex items-center justify-center"><Lock className="h-8 w-8 text-amber-400" /></div>
        <h2 className="text-xl font-bold text-white">Chapter Terkunci</h2>
        <p className="text-zinc-400 text-sm max-w-sm">{data.chapter.title} dari {data.comic.title} terkunci. Tonton iklan singkat untuk membukanya gratis.</p>
        <Button className="bg-violet-600 hover:bg-violet-500 gap-2" onClick={() => { if (!user) return onLoginNeeded(); setAdChapter(data.chapter) }}>
          <Play className="h-4 w-4" /> Tonton Iklan untuk Membuka
        </Button>
        <button onClick={onBack} className="text-sm text-zinc-500 hover:text-white">Kembali ke detail</button>
        <AdModal open={!!adChapter} chapter={adChapter} onClose={() => setAdChapter(null)} onComplete={async () => { await api('/unlock', { method: 'POST', body: JSON.stringify({ chapterId: data.chapter.id }) }); setAdChapter(null); load() }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${showBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-300 hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{data.comic.title}</p>
            <p className="text-xs text-zinc-500">Ch. {data.chapter.chapterNumber} — {data.chapter.title}</p>
          </div>
        </div>
      </div>

      {/* Vertical panels */}
      <div className="max-w-2xl mx-auto pt-16">
        {data.pages.map((p) => (
          <img key={p.id} src={p.imageUrl} loading="lazy" alt={`Halaman ${p.pageOrder}`} className="w-full block select-none" />
        ))}
      </div>

      {/* End of chapter nav */}
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-between gap-3">
        <Button variant="outline" className="flex-1 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 gap-1" disabled={!data.prev} onClick={() => goChapter(data.prev)}>
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        <Button className="flex-1 bg-violet-600 hover:bg-violet-500 gap-1" disabled={!data.next} onClick={() => goChapter(data.next)}>
          {data.next?.isLocked ? <><Lock className="h-4 w-4" /> Buka Ch.{data.next.chapterNumber}</> : <>Selanjutnya <ChevronRight className="h-4 w-4" /></>}
        </Button>
      </div>

      {/* Comments */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <h3 className="flex items-center gap-2 text-white font-bold mb-4"><MessageCircle className="h-5 w-5" /> Komentar ({comments.length})</h3>
        <div className="flex gap-2 mb-6">
          <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={user ? 'Tulis komentar...' : 'Masuk untuk berkomentar'} className="bg-zinc-900 border-zinc-800" onKeyDown={(e) => e.key === 'Enter' && postComment()} />
          <Button onClick={postComment} className="bg-violet-600 hover:bg-violet-500">Kirim</Button>
        </div>
        <div className="space-y-4">
          {comments.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">Jadilah yang pertama berkomentar!</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0"><AvatarImage src={c.userAvatar} /><AvatarFallback>{c.userName?.[0]}</AvatarFallback></Avatar>
              <div>
                <div className="flex items-center gap-2"><span className="text-sm font-medium text-zinc-200">{c.userName}</span><span className="text-xs text-zinc-600">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span></div>
                <p className="text-sm text-zinc-400">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdModal open={!!adChapter} chapter={adChapter} onClose={() => setAdChapter(null)} onComplete={completeAd} />
    </div>
  )
}

// ---------------- Creator Studio ----------------
function CreatorView({ user, onOpenComic }) {
  const [comics, setComics] = useState([])
  const [stats, setStats] = useState({ totalViews: 0, totalImpressions: 0, totalSeries: 0 })
  const [tab, setTab] = useState('list') // list | newComic | newChapter
  const [form, setForm] = useState({ title: '', synopsis: '', genre: 'Sci-Fi', coverImage: '' })
  const [chForm, setChForm] = useState({ comicId: '', title: '', isLocked: false, pages: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await api('/creator/comics')
      setComics(d.comics)
      setStats(d.stats)
    } catch (e) { toast.error(e.message) }
  }, [])
  useEffect(() => { load() }, [load])

  const createComic = async () => {
    if (!form.title || !form.coverImage) return toast.error('Judul & URL sampul wajib diisi')
    setSaving(true)
    try {
      await api('/comics', { method: 'POST', body: JSON.stringify(form) })
      toast.success('Seri dibuat! Menunggu moderasi admin.')
      setForm({ title: '', synopsis: '', genre: 'Sci-Fi', coverImage: '' })
      setTab('list'); load()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  const createChapter = async () => {
    const pages = chForm.pages.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!chForm.comicId || pages.length === 0) return toast.error('Pilih seri & masukkan minimal 1 URL panel')
    setSaving(true)
    try {
      await api('/chapters', { method: 'POST', body: JSON.stringify({ ...chForm, pages }) })
      toast.success(`Chapter ditambahkan (${pages.length} panel)`) 
      setChForm({ comicId: '', title: '', isLocked: false, pages: '' })
      setTab('list'); load()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><PenSquare className="h-6 w-6 text-violet-500" /> Creator Studio</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800 bg-zinc-900 gap-1" onClick={() => setTab('newChapter')}><Upload className="h-4 w-4" /> Upload Chapter</Button>
          <Button className="bg-violet-600 hover:bg-violet-500 gap-1" onClick={() => setTab('newComic')}><Plus className="h-4 w-4" /> Seri Baru</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ l: 'Total Seri', v: stats.totalSeries, i: BookOpen }, { l: 'Total Pembaca', v: fmt(stats.totalViews), i: Eye }, { l: 'Impresi Iklan', v: fmt(stats.totalImpressions), i: Play }].map((s) => (
          <Card key={s.l} className="bg-zinc-900 border-zinc-800 p-4">
            <s.i className="h-5 w-5 text-violet-400 mb-2" />
            <p className="text-2xl font-black text-white">{s.v}</p>
            <p className="text-xs text-zinc-500">{s.l}</p>
          </Card>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-2">
          {comics.length === 0 && <p className="text-zinc-500 text-sm py-8 text-center">Belum ada seri. Buat seri pertamamu!</p>}
          {comics.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 ring-1 ring-white/5">
              <img src={c.coverImage} className="w-12 h-16 object-cover rounded" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                <p className="text-xs text-zinc-500">{c.chapterCount} chapter • {fmt(c.views)} views</p>
              </div>
              <Badge className={`border-0 text-[10px] ${c.status === 'PUBLISHED' ? 'bg-emerald-500/15 text-emerald-400' : c.status === 'UNDER_REVIEW' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>{c.status}</Badge>
              <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-950" onClick={() => setChForm((f) => ({ ...f, comicId: c.id })) || setTab('newChapter')}>+ Chapter</Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'newComic' && (
        <Card className="bg-zinc-900 border-zinc-800 p-5 space-y-4 max-w-xl">
          <h2 className="font-bold text-white">Buat Seri Baru</h2>
          <Input placeholder="Judul komik" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          <Textarea placeholder="Sinopsis" value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          <Select value={form.genre} onValueChange={(v) => setForm({ ...form, genre: v })}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
            <SelectContent>{GENRES.filter((g) => g !== 'All').map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="URL gambar sampul" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          {form.coverImage && <img src={form.coverImage} className="w-24 aspect-[3/4] object-cover rounded" alt="" />}
          <div className="flex gap-2">
            <Button onClick={createComic} disabled={saving} className="bg-violet-600 hover:bg-violet-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buat Seri'}</Button>
            <Button variant="ghost" onClick={() => setTab('list')}>Batal</Button>
          </div>
        </Card>
      )}

      {tab === 'newChapter' && (
        <Card className="bg-zinc-900 border-zinc-800 p-5 space-y-4 max-w-xl">
          <h2 className="font-bold text-white">Upload Chapter Baru</h2>
          <Select value={chForm.comicId} onValueChange={(v) => setChForm({ ...chForm, comicId: v })}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue placeholder="Pilih seri" /></SelectTrigger>
            <SelectContent>{comics.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Judul chapter (opsional)" value={chForm.title} onChange={(e) => setChForm({ ...chForm, title: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          <Textarea rows={6} placeholder="Tempel URL panel gambar, satu URL per baris (urutan = urutan scroll vertikal)" value={chForm.pages} onChange={(e) => setChForm({ ...chForm, pages: e.target.value })} className="bg-zinc-950 border-zinc-800 font-mono text-xs" />
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={chForm.isLocked} onChange={(e) => setChForm({ ...chForm, isLocked: e.target.checked })} className="accent-violet-600 h-4 w-4" />
            Kunci chapter ini (butuh tonton iklan untuk membuka)
          </label>
          <div className="flex gap-2">
            <Button onClick={createChapter} disabled={saving} className="bg-violet-600 hover:bg-violet-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Chapter'}</Button>
            <Button variant="ghost" onClick={() => setTab('list')}>Batal</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

// ---------------- Admin View ----------------
function AdminView() {
  const [comics, setComics] = useState([])
  const load = useCallback(async () => {
    try { const d = await api('/admin/comics'); setComics(d.comics) } catch (e) { toast.error(e.message) }
  }, [])
  useEffect(() => { load() }, [load])

  const moderate = async (comicId, status) => {
    try { await api('/admin/moderate', { method: 'POST', body: JSON.stringify({ comicId, status }) }); toast.success(`Status: ${status}`); load() } catch (e) { toast.error(e.message) }
  }

  const pending = comics.filter((c) => c.status === 'UNDER_REVIEW')
  const others = comics.filter((c) => c.status !== 'UNDER_REVIEW')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6"><Shield className="h-6 w-6 text-violet-500" /> Panel Moderasi Admin</h1>
      <h2 className="text-sm font-semibold text-amber-400 mb-3">Menunggu Persetujuan ({pending.length})</h2>
      <div className="space-y-2 mb-8">
        {pending.length === 0 && <p className="text-zinc-500 text-sm">Tidak ada konten menunggu moderasi.</p>}
        {pending.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 ring-1 ring-amber-500/20">
            <img src={c.coverImage} className="w-12 h-16 object-cover rounded" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{c.title}</p>
              <p className="text-xs text-zinc-500 truncate">{c.creatorName} • {c.genre}</p>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 gap-1" onClick={() => moderate(c.id, 'PUBLISHED')}><Check className="h-4 w-4" /> Setujui</Button>
            <Button size="sm" variant="outline" className="border-red-500/40 text-red-400 gap-1" onClick={() => moderate(c.id, 'REJECTED')}><Ban className="h-4 w-4" /> Tolak</Button>
          </div>
        ))}
      </div>
      <h2 className="text-sm font-semibold text-zinc-400 mb-3">Semua Konten ({others.length})</h2>
      <div className="space-y-2">
        {others.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 ring-1 ring-white/5">
            <img src={c.coverImage} className="w-10 h-14 object-cover rounded" alt="" />
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{c.title}</p><p className="text-xs text-zinc-500">{c.creatorName}</p></div>
            <Badge className={`border-0 text-[10px] ${c.status === 'PUBLISHED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{c.status}</Badge>
            {c.status !== 'PUBLISHED' && <Button size="sm" variant="ghost" className="text-emerald-400" onClick={() => moderate(c.id, 'PUBLISHED')}>Publish</Button>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- Navbar ----------------
function Navbar({ user, view, onNav, onLogin, onLogout, onRole }) {
  return (
    <nav className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <button onClick={() => onNav('home')} className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center"><Sparkles className="h-5 w-5 text-white" /></div>
          <span className="font-black text-white text-lg tracking-tight">Komik<span className="text-violet-400">AI</span></span>
        </button>

        <div className="flex items-center gap-2">
          {user && ['CREATOR', 'ADMIN'].includes(user.role) && (
            <Button variant="ghost" size="sm" className={view === 'creator' ? 'text-violet-400' : 'text-zinc-400'} onClick={() => onNav('creator')}>Studio</Button>
          )}
          {user && user.role === 'ADMIN' && (
            <Button variant="ghost" size="sm" className={view === 'admin' ? 'text-violet-400' : 'text-zinc-400'} onClick={() => onNav('admin')}>Admin</Button>
          )}
          {!user ? (
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500" onClick={onLogin}>Masuk</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="h-8 w-8"><AvatarImage src={user.avatar} /><AvatarFallback className="bg-violet-600 text-white text-xs">{user.name?.[0]}</AvatarFallback></Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  <Badge className="mt-1 bg-violet-600 border-0 text-[10px]">{user.role}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuLabel className="text-[10px] text-zinc-500 font-normal">Ganti peran (demo)</DropdownMenuLabel>
                {['READER', 'CREATOR', 'ADMIN'].map((r) => (
                  <DropdownMenuItem key={r} onClick={() => onRole(r)} className="cursor-pointer">
                    {user.role === r && <Check className="h-4 w-4 mr-2 text-violet-400" />}
                    <span className={user.role === r ? '' : 'ml-6'}>{r}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-400"><LogOut className="h-4 w-4 mr-2" /> Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}

// ---------------- Root App ----------------
function App() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home')
  const [comicId, setComicId] = useState(null)
  const [chapterId, setChapterId] = useState(null)
  const [detailRefresh, setDetailRefresh] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  const loadUser = useCallback(async () => {
    try { const d = await api('/auth/me'); setUser(d.user) } catch (e) { setUser(null) }
  }, [])
  useEffect(() => { if (mounted) loadUser() }, [mounted, loadUser])

  // Deterministic server-rendered splash (avoids hydration mismatches from
  // injected input attributes in embedded/preview browsers).
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center"><Sparkles className="h-5 w-5 text-white" /></div>
          <span className="font-black text-white text-xl tracking-tight">Komik<span className="text-violet-400">AI</span></span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    )
  }

  const login = () => {
    const redirect = `${window.location.origin}/auth/callback`
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`
  }
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); setView('home'); toast.success('Berhasil keluar') }
  const setRole = async (role) => {
    try { const d = await api('/auth/role', { method: 'POST', body: JSON.stringify({ role }) }); setUser(d.user); toast.success(`Peran diubah ke ${role}`) } catch (e) { toast.error(e.message) }
  }
  const loginNeeded = () => { toast.info('Masuk dulu untuk membuka chapter berbayar'); login() }

  const openComic = (id) => { setComicId(id); setView('detail'); window.scrollTo(0, 0) }
  const openReader = (id) => { setChapterId(id); setView('reader') }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {view !== 'reader' && (
        <Navbar user={user} view={view} onNav={(v) => setView(v)} onLogin={login} onLogout={logout} onRole={setRole} />
      )}

      {view === 'home' && <HomeView onOpenComic={openComic} />}
      {view === 'detail' && comicId && (
        <DetailView comicId={comicId} user={user} refreshKey={detailRefresh} onBack={() => setView('home')} onRead={openReader} onLoginNeeded={loginNeeded} />
      )}
      {view === 'reader' && chapterId && (
        <ReaderView chapterId={chapterId} user={user} onBack={() => { setDetailRefresh((n) => n + 1); setView('detail') }} onOpenChapter={openReader} onLoginNeeded={loginNeeded} />
      )}
      {view === 'creator' && (user && ['CREATOR', 'ADMIN'].includes(user.role) ? <CreatorView user={user} onOpenComic={openComic} /> : <AccessGate msg="Kamu perlu peran CREATOR. Ubah peran lewat menu profil (demo)." />)}
      {view === 'admin' && (user && user.role === 'ADMIN' ? <AdminView /> : <AccessGate msg="Kamu perlu peran ADMIN. Ubah peran lewat menu profil (demo)." />)}
    </div>
  )
}

function AccessGate({ msg }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Shield className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
      <p className="text-zinc-400 text-sm">{msg}</p>
    </div>
  )
}

export default App
