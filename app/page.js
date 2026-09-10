'use client'

import { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react'
import { toast } from 'sonner'
import {
  Lock, Search, LogOut, Plus, Upload, ChevronLeft, ChevronRight,
  MessageCircle, Play, Shield, Flame, Sparkles, Eye, BookOpen,
  Check, Ban, Clock, PenSquare, ArrowLeft, Loader2, Globe,
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

/* ----------------------------- i18n ----------------------------- */
const translations = {
  en: {
    signIn: 'Sign in', studio: 'Studio', admin: 'Admin', logout: 'Log out',
    roleDemo: 'Switch role (demo)',
    searchPlaceholder: 'Search comic title...', latest: 'Latest', popular: 'Popular',
    all: 'All', popularWeek: 'Popular This Week', latestComics: 'Latest AI Comics',
    results: 'Results', noComics: 'No comics found.',
    back: 'Back', aiCreator: 'AI Creator', chaptersWord: 'Chapters', readFromStart: 'Read from Start',
    chapterList: 'Chapter List', free: 'Free', ad: 'Ad',
    chapterLocked: 'Chapter Locked',
    lockedDesc: '{title} of {comic} is locked. Watch a short ad to unlock it for free.',
    watchAdUnlock: 'Watch Ad to Unlock', backToDetail: 'Back to detail',
    previous: 'Previous', next: 'Next', unlockCh: 'Unlock Ch.{n}',
    comments: 'Comments', writeComment: 'Write a comment...', signInToComment: 'Sign in to comment',
    send: 'Send', firstComment: 'Be the first to comment!',
    adLabel: 'AD', adPlaying: 'Ad is playing...', adFinished: 'Ad finished!',
    unlockTitle: 'Unlock {title}',
    adDesc: 'Watch the ad to the end to unlock this chapter for free, permanently on your account.',
    claimUnlock: 'Claim & Unlock Chapter', unlocking: 'Unlocking...', waitSeconds: 'Wait {n}s...',
    creatorStudio: 'Creator Studio', uploadChapter: 'Upload Chapter', newSeries: 'New Series',
    totalSeries: 'Total Series', totalReaders: 'Total Readers', adImpressions: 'Ad Impressions',
    noSeries: 'No series yet. Create your first!', chapterWord: 'chapters', viewsWord: 'views',
    addChapter: '+ Chapter', createNewSeries: 'Create New Series', comicTitle: 'Comic title',
    synopsis: 'Synopsis', coverUrl: 'Cover image URL', createSeries: 'Create Series', cancel: 'Cancel',
    uploadNewChapter: 'Upload New Chapter', selectSeries: 'Select series', chapterTitleOpt: 'Chapter title (optional)',
    panelsPlaceholder: 'Paste panel image URLs, one per line (order = vertical scroll order)',
    lockThisChapter: 'Lock this chapter (requires watching an ad to unlock)', uploadChapterBtn: 'Upload Chapter',
    adminPanel: 'Admin Moderation Panel', pendingApproval: 'Pending Approval', noModeration: 'No content awaiting moderation.',
    approve: 'Approve', reject: 'Reject', allContent: 'All Content', publish: 'Publish',
    gateCreator: 'You need the CREATOR role. Switch role from the profile menu (demo).',
    gateAdmin: 'You need the ADMIN role. Switch role from the profile menu (demo).',
    tUnlocked: 'Chapter unlocked!', tSignedOut: 'Signed out', tRoleChanged: 'Role changed to {r}',
    tSignInUnlock: 'Sign in to unlock paid chapters', tSeriesCreated: 'Series created! Awaiting admin moderation.',
    tTitleCover: 'Title & cover URL are required', tChapterAdded: 'Chapter added ({n} panels)',
    tSelectPanels: 'Select a series & add at least 1 panel URL', tStatus: 'Status: {s}',
    heroBadge: 'Fun AI Comics', heroKicker: 'Read free • Unlock with ads',
  },
  id: {
    signIn: 'Masuk', studio: 'Studio', admin: 'Admin', logout: 'Keluar',
    roleDemo: 'Ganti peran (demo)',
    searchPlaceholder: 'Cari judul komik...', latest: 'Terbaru', popular: 'Terpopuler',
    all: 'Semua', popularWeek: 'Populer Minggu Ini', latestComics: 'Komik AI Terbaru',
    results: 'Hasil', noComics: 'Tidak ada komik ditemukan.',
    back: 'Kembali', aiCreator: 'AI Creator', chaptersWord: 'Chapter', readFromStart: 'Baca dari Awal',
    chapterList: 'Daftar Chapter', free: 'Gratis', ad: 'Iklan',
    chapterLocked: 'Chapter Terkunci',
    lockedDesc: '{title} dari {comic} terkunci. Tonton iklan singkat untuk membukanya gratis.',
    watchAdUnlock: 'Tonton Iklan untuk Membuka', backToDetail: 'Kembali ke detail',
    previous: 'Sebelumnya', next: 'Selanjutnya', unlockCh: 'Buka Ch.{n}',
    comments: 'Komentar', writeComment: 'Tulis komentar...', signInToComment: 'Masuk untuk berkomentar',
    send: 'Kirim', firstComment: 'Jadilah yang pertama berkomentar!',
    adLabel: 'IKLAN', adPlaying: 'Iklan sedang diputar...', adFinished: 'Iklan selesai!',
    unlockTitle: 'Buka {title}',
    adDesc: 'Tonton iklan sampai selesai untuk membuka chapter ini secara gratis dan permanen di akunmu.',
    claimUnlock: 'Klaim & Buka Chapter', unlocking: 'Membuka...', waitSeconds: 'Tunggu {n} detik...',
    creatorStudio: 'Creator Studio', uploadChapter: 'Upload Chapter', newSeries: 'Seri Baru',
    totalSeries: 'Total Seri', totalReaders: 'Total Pembaca', adImpressions: 'Impresi Iklan',
    noSeries: 'Belum ada seri. Buat seri pertamamu!', chapterWord: 'chapter', viewsWord: 'pembaca',
    addChapter: '+ Chapter', createNewSeries: 'Buat Seri Baru', comicTitle: 'Judul komik',
    synopsis: 'Sinopsis', coverUrl: 'URL gambar sampul', createSeries: 'Buat Seri', cancel: 'Batal',
    uploadNewChapter: 'Upload Chapter Baru', selectSeries: 'Pilih seri', chapterTitleOpt: 'Judul chapter (opsional)',
    panelsPlaceholder: 'Tempel URL panel gambar, satu URL per baris (urutan = urutan scroll vertikal)',
    lockThisChapter: 'Kunci chapter ini (butuh tonton iklan untuk membuka)', uploadChapterBtn: 'Upload Chapter',
    adminPanel: 'Panel Moderasi Admin', pendingApproval: 'Menunggu Persetujuan', noModeration: 'Tidak ada konten menunggu moderasi.',
    approve: 'Setujui', reject: 'Tolak', allContent: 'Semua Konten', publish: 'Publish',
    gateCreator: 'Kamu perlu peran CREATOR. Ubah peran lewat menu profil (demo).',
    gateAdmin: 'Kamu perlu peran ADMIN. Ubah peran lewat menu profil (demo).',
    tUnlocked: 'Chapter berhasil dibuka!', tSignedOut: 'Berhasil keluar', tRoleChanged: 'Peran diubah ke {r}',
    tSignInUnlock: 'Masuk dulu untuk membuka chapter berbayar', tSeriesCreated: 'Seri dibuat! Menunggu moderasi admin.',
    tTitleCover: 'Judul & URL sampul wajib diisi', tChapterAdded: 'Chapter ditambahkan ({n} panel)',
    tSelectPanels: 'Pilih seri & masukkan minimal 1 URL panel', tStatus: 'Status: {s}',
    heroBadge: 'Komik AI Seru', heroKicker: 'Baca gratis • Buka via iklan',
  },
}

const I18nContext = createContext({ lang: 'en', setLang: () => {} })
const useI18n = () => {
  const { lang, setLang } = useContext(I18nContext)
  const t = (key, vars) => {
    let s = (translations[lang] && translations[lang][key]) ?? translations.en[key] ?? key
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k])
    return s
  }
  return { t, lang, setLang }
}
const detectLang = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const nav = (navigator.language || '').toLowerCase()
    const idTz = ['Jakarta', 'Makassar', 'Jayapura', 'Pontianak'].some((z) => tz.includes(z))
    if (idTz || nav.startsWith('id')) return 'id'
    return 'en'
  } catch { return 'en' }
}

/* ----------------------------- data ----------------------------- */
const GENRES = ['All', 'Sci-Fi', 'Fantasy', 'Action', 'Horror', 'Romance', 'Comedy', 'Drama']

const BANNERS = [
  { img: 'https://images.unsplash.com/photo-1573767291321-c0af2eaf5266?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmslMjBjaXR5fGVufDB8fHxibHVlfDE3ODkwMTMxNDF8MA&ixlib=rb-4.1.0&q=85', tag: 'CYBERPUNK', title: 'Neon Requiem', en: 'A cyberpunk opera painted entirely by AI', id: 'Opera cyberpunk yang dilukis sepenuhnya oleh AI' },
  { img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDB8fHx8MTc4OTAxMzE0Nnww&ixlib=rb-4.1.0&q=85', tag: 'FANTASY', title: 'Ember & Ash', en: 'Twin witches face an ancient dragon born from ashes', id: 'Dua penyihir kembar melawan naga purba dari abu peradaban' },
  { img: 'https://images.unsplash.com/photo-1537210249814-b9a10a161ae4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxkcmFtYXRpYyUyMHNreXxlbnwwfHx8Ymx1ZXwxNzg5MDEzMTQxfDA&ixlib=rb-4.1.0&q=85', tag: 'SCI-FI', title: 'The Last Algorithm', en: 'The last AI on earth searches for what it means to be human', id: 'AI terakhir di bumi mencari arti menjadi manusia' },
]

const fmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n || 0)
}
const dloc = (lang) => (lang === 'id' ? 'id-ID' : 'en-US')

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

/* --------------------------- Mascot (cute chibi anime girl) --------------------------- */
function MascotGirl({ className }) {
  return (
    <svg viewBox="0 0 240 320" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* sparkles */}
      <g fill="#ffd166">
        <path className="animate-sparkle" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} d="M30 60 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" />
        <path className="animate-sparkle" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '0.6s' }} d="M212 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#ff6b6b" />
        <path className="animate-sparkle" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '1.1s' }} d="M205 150 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
      </g>

      <g className="animate-float-y" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* hair back */}
        <path d="M60 120 C55 55 115 30 120 30 C125 30 185 55 180 120 C182 175 165 210 120 210 C75 210 58 175 60 120 Z" fill="#5b3b2e" />
        {/* twin tails */}
        <ellipse cx="52" cy="150" rx="26" ry="46" fill="#6b4636" />
        <ellipse cx="188" cy="150" rx="26" ry="46" fill="#6b4636" />
        {/* bow on right tail */}
        <g transform="translate(188,108)">
          <path d="M0 0 L-20 -12 L-20 12 Z" fill="#00d564" />
          <path d="M0 0 L20 -12 L20 12 Z" fill="#00d564" />
          <circle cx="0" cy="0" r="7" fill="#00b552" />
        </g>

        {/* legs */}
        <rect x="98" y="252" width="16" height="34" rx="8" fill="#ffe0c4" />
        <rect x="126" y="252" width="16" height="34" rx="8" fill="#ffe0c4" />
        <ellipse cx="104" cy="290" rx="16" ry="10" fill="#ff6b6b" />
        <ellipse cx="136" cy="290" rx="16" ry="10" fill="#ff6b6b" />

        {/* hoodie body */}
        <path d="M78 200 C78 185 92 178 120 178 C148 178 162 185 162 200 L168 256 C168 266 158 270 120 270 C82 270 72 266 72 256 Z" fill="#00d564" />
        <path d="M120 178 L120 232" stroke="#00b552" strokeWidth="4" strokeLinecap="round" />
        {/* pocket */}
        <path d="M100 236 h40 v6 a6 6 0 0 1 -6 6 h-28 a6 6 0 0 1 -6 -6 z" fill="#00b552" />

        {/* left arm (down) */}
        <path d="M82 200 C64 210 58 234 66 250 C72 260 84 258 86 246 C82 232 86 214 96 206 Z" fill="#00b552" />
        <circle cx="70" cy="252" r="9" fill="#ffe0c4" />

        {/* right arm (waving) */}
        <g className="animate-wiggle" style={{ transformBox: 'fill-box', transformOrigin: '70% 90%' }}>
          <path d="M158 200 C182 196 196 174 190 152 C186 142 174 144 172 156 C176 172 168 190 150 196 Z" fill="#00b552" />
          <circle cx="190" cy="150" r="12" fill="#ffe0c4" />
        </g>

        {/* head */}
        <circle cx="120" cy="118" r="60" fill="#ffe6cf" />
        {/* bangs */}
        <path d="M62 108 C66 66 96 54 120 54 C144 54 174 66 178 108 C158 92 150 96 142 104 C138 84 128 80 120 80 C112 80 102 84 98 104 C90 96 82 92 62 108 Z" fill="#5b3b2e" />

        {/* eyes */}
        <g>
          <ellipse cx="98" cy="122" rx="14" ry="17" fill="#ffffff" />
          <ellipse cx="142" cy="122" rx="14" ry="17" fill="#ffffff" />
          <circle cx="99" cy="124" r="10" fill="#00b552" />
          <circle cx="143" cy="124" r="10" fill="#00b552" />
          <circle cx="99" cy="125" r="5" fill="#1a1a1a" />
          <circle cx="143" cy="125" r="5" fill="#1a1a1a" />
          <circle cx="95" cy="119" r="3.2" fill="#ffffff" />
          <circle cx="139" cy="119" r="3.2" fill="#ffffff" />
        </g>
        {/* brows */}
        <path d="M86 104 q12 -6 24 -1" stroke="#5b3b2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M130 103 q12 -5 24 1" stroke="#5b3b2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* blush */}
        <ellipse cx="78" cy="140" rx="10" ry="6" fill="#ff9aa2" opacity="0.8" />
        <ellipse cx="162" cy="140" rx="10" ry="6" fill="#ff9aa2" opacity="0.8" />
        {/* mouth */}
        <path d="M110 146 q10 12 20 0" stroke="#c0473f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/* --------------------------- Rewarded Ad Modal --------------------------- */
function AdModal({ open, chapter, onClose, onComplete }) {
  const { t } = useI18n()
  const [count, setCount] = useState(15)
  const [done, setDone] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!open) return
    setCount(15); setDone(false)
    const timer = setInterval(() => {
      setCount((c) => { if (c <= 1) { clearInterval(timer); setDone(true); return 0 } return c - 1 })
    }, 1000)
    return () => clearInterval(timer)
  }, [open])

  const claim = async () => { setClaiming(true); try { await onComplete() } finally { setClaiming(false) } }
  const pct = ((15 - count) / 15) * 100

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !claiming) onClose() }}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 overflow-hidden p-0">
        <div className="relative aspect-video bg-gradient-to-br from-webtoon via-sunny to-coral flex flex-col items-center justify-center">
          <div className="absolute top-3 left-3"><Badge className="bg-black/40 text-white border-0 text-[10px]">{t('adLabel')}</Badge></div>
          {!done ? (
            <>
              <Play className="h-12 w-12 text-white/95 mb-2" />
              <p className="text-white/95 text-sm font-semibold drop-shadow">{t('adPlaying')}</p>
              <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-sm font-bold tabular-nums">{count}</div>
            </>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="h-14 w-14 rounded-full bg-white/25 flex items-center justify-center mb-2"><Check className="h-8 w-8 text-white" /></div>
              <p className="text-white font-bold drop-shadow">{t('adFinished')}</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 h-1.5 bg-white/90 transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-webtoon"><Lock className="h-4 w-4" /><span className="text-sm font-semibold">{t('unlockTitle', { title: chapter?.title || 'Chapter' })}</span></div>
          <p className="text-sm text-zinc-400">{t('adDesc')}</p>
          <Button className="w-full bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold disabled:opacity-50" disabled={!done || claiming} onClick={claim}>
            {claiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : done ? <Sparkles className="h-4 w-4 mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            {claiming ? t('unlocking') : done ? t('claimUnlock') : t('waitSeconds', { n: count })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------- Comic Card --------------------------- */
function ComicCard({ comic, onClick, rank }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/5 group-hover:ring-webtoon/60 transition">
        <img src={comic.coverImage} alt={comic.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {rank != null && <span className="absolute top-2 left-2 text-3xl font-black text-white drop-shadow-lg italic">{rank}</span>}
        <Badge className="absolute top-2 right-2 bg-webtoon/90 text-zinc-950 border-0 text-[10px] font-bold">{comic.genre}</Badge>
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-[11px] text-zinc-200"><Eye className="h-3 w-3" /> {fmt(comic.views)}</div>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-100 truncate group-hover:text-webtoon transition">{comic.title}</h3>
      <p className="text-xs text-zinc-500 truncate">{comic.creatorName}</p>
    </div>
  )
}

/* --------------------------- Home View --------------------------- */
function HomeView({ onOpenComic }) {
  const { t, lang } = useI18n()
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
  useEffect(() => { const it = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 5000); return () => clearInterval(it) }, [])

  const popular = [...comics].sort((a, b) => b.views - a.views).slice(0, 6)

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="relative h-[260px] sm:h-[380px] overflow-hidden">
        {BANNERS.map((b, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
            <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 sm:p-10 max-w-xl">
              <Badge className="bg-sunny text-zinc-950 border-0 mb-3 font-bold">{b.tag}</Badge>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">{b.title}</h2>
              <p className="text-zinc-200 text-sm sm:text-base mt-2">{lang === 'id' ? b.id : b.en}</p>
            </div>
          </div>
        ))}
        {/* Cute mascot in front */}
        <MascotGirl className="absolute bottom-0 right-2 sm:right-10 h-[220px] sm:h-[330px] w-auto drop-shadow-2xl pointer-events-none z-10" />
        <div className="absolute top-4 right-4 z-20 rounded-full bg-black/40 backdrop-blur px-3 py-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-sunny" />
          <span className="text-[11px] font-semibold text-white">{t('heroKicker')}</span>
        </div>
        <div className="absolute bottom-4 left-5 sm:left-10 flex gap-1.5 z-20">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)} className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? 'w-6 bg-webtoon' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-webtoon" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">{t('latest')}</SelectItem>
              <SelectItem value="popular">{t('popular')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
          {GENRES.map((g) => (
            <button key={g} onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition font-medium ${genre === g ? 'bg-webtoon text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
              {g === 'All' ? t('all') : g}
            </button>
          ))}
        </div>

        {genre === 'All' && !q && popular.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Flame className="h-5 w-5 text-coral" /> {t('popularWeek')}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {popular.map((c, i) => <ComicCard key={c.id} comic={c} rank={i + 1} onClick={() => onOpenComic(c.id)} />)}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Sparkles className="h-5 w-5 text-webtoon" /> {genre === 'All' && !q ? t('latestComics') : t('results')}</h2>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl bg-zinc-900 animate-pulse" />)}
            </div>
          ) : comics.length === 0 ? (
            <p className="text-zinc-500 text-sm py-10 text-center">{t('noComics')}</p>
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

/* --------------------------- Detail View --------------------------- */
function DetailView({ comicId, user, onBack, onRead, onLoginNeeded, refreshKey }) {
  const { t, lang } = useI18n()
  const [comic, setComic] = useState(null)
  const [chapters, setChapters] = useState([])
  const [adChapter, setAdChapter] = useState(null)

  const load = useCallback(async () => {
    try { const data = await api(`/comics/${comicId}`); setComic(data.comic); setChapters(data.chapters) } catch (e) { toast.error(e.message) }
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
      toast.success(t('tUnlocked'))
      const id = adChapter.id; setAdChapter(null); await load(); onRead(id)
    } catch (e) { toast.error(e.message) }
  }

  if (!comic) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-webtoon" /></div>
  const firstChapter = chapters[0]

  return (
    <div className="pb-24">
      <div className="relative">
        <div className="absolute inset-0 h-64 overflow-hidden">
          <img src={comic.coverImage} className="w-full h-full object-cover blur-xl scale-110 opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 pt-4">
          <button onClick={onBack} className="flex items-center gap-1 text-zinc-300 hover:text-webtoon text-sm mb-4"><ArrowLeft className="h-4 w-4" /> {t('back')}</button>
          <div className="flex gap-4 sm:gap-6">
            <img src={comic.coverImage} alt={comic.title} className="w-28 sm:w-44 aspect-[3/4] object-cover rounded-xl ring-1 ring-white/10 shadow-2xl shrink-0" />
            <div className="flex-1 min-w-0">
              <Badge className="bg-webtoon text-zinc-950 border-0 mb-2 font-bold">{comic.genre}</Badge>
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">{comic.title}</h1>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Avatar className="h-7 w-7"><AvatarImage src={comic.creatorAvatar} /><AvatarFallback className="bg-webtoon text-zinc-950">{comic.creatorName?.[0]}</AvatarFallback></Avatar>
                <span className="text-sm text-zinc-300">{comic.creatorName}</span>
                <Badge variant="outline" className="border-webtoon/50 text-webtoon text-[10px] gap-1"><Sparkles className="h-3 w-3" /> {t('aiCreator')}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-zinc-400">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {fmt(comic.views)}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {chapters.length} {t('chaptersWord')}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mt-5">{comic.synopsis}</p>
          {firstChapter && <Button onClick={() => handleChapter(firstChapter)} className="mt-5 bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold gap-2"><BookOpen className="h-4 w-4" /> {t('readFromStart')}</Button>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-bold text-white mb-3">{t('chapterList')}</h2>
        <div className="space-y-2">
          {chapters.map((ch) => (
            <button key={ch.id} onClick={() => handleChapter(ch)} className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition text-left ring-1 ring-white/5 hover:ring-webtoon/40">
              <div className="flex items-center gap-3"><span className="text-sm font-semibold text-zinc-200">Ch. {ch.chapterNumber}</span><span className="text-sm text-zinc-400">{ch.title}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">{new Date(ch.createdAt).toLocaleDateString(dloc(lang))}</span>
                {ch.unlocked ? <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">{t('free')}</Badge> : <Badge className="bg-sunny/15 text-sunny border-0 text-[10px] gap-1"><Lock className="h-3 w-3" /> {t('ad')}</Badge>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <AdModal open={!!adChapter} chapter={adChapter} onClose={() => setAdChapter(null)} onComplete={completeAd} />
    </div>
  )
}

/* --------------------------- Reader View --------------------------- */
function ReaderView({ chapterId, user, onBack, onOpenChapter, onLoginNeeded }) {
  const { t, lang } = useI18n()
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
      if (!d.locked) { const c = await api(`/comments?chapterId=${chapterId}`); setComments(c.comments) }
      window.scrollTo(0, 0)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }, [chapterId])
  useEffect(() => { load() }, [load])

  useEffect(() => {
    const onScroll = () => { const y = window.scrollY; setShowBar(y < lastScroll.current || y < 100); lastScroll.current = y }
    window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goChapter = (target) => {
    if (!target) return
    if (target.isLocked) { if (!user) { onLoginNeeded(); return } setAdChapter(target) }
    else onOpenChapter(target.id)
  }
  const completeAd = async () => {
    try { await api('/unlock', { method: 'POST', body: JSON.stringify({ chapterId: adChapter.id }) }); toast.success(t('tUnlocked')); const id = adChapter.id; setAdChapter(null); onOpenChapter(id) } catch (e) { toast.error(e.message) }
  }
  const postComment = async () => {
    if (!user) { onLoginNeeded(); return }
    if (!newComment.trim()) return
    try { const d = await api('/comments', { method: 'POST', body: JSON.stringify({ chapterId, content: newComment.trim() }) }); setComments([d.comment, ...comments]); setNewComment('') } catch (e) { toast.error(e.message) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-webtoon" /></div>
  if (!data) return null

  if (data.locked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-sunny/15 flex items-center justify-center"><Lock className="h-8 w-8 text-sunny" /></div>
        <h2 className="text-xl font-bold text-white">{t('chapterLocked')}</h2>
        <p className="text-zinc-400 text-sm max-w-sm">{t('lockedDesc', { title: data.chapter.title, comic: data.comic.title })}</p>
        <Button className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold gap-2" onClick={() => { if (!user) return onLoginNeeded(); setAdChapter(data.chapter) }}><Play className="h-4 w-4" /> {t('watchAdUnlock')}</Button>
        <button onClick={onBack} className="text-sm text-zinc-500 hover:text-webtoon">{t('backToDetail')}</button>
        <AdModal open={!!adChapter} chapter={adChapter} onClose={() => setAdChapter(null)} onComplete={async () => { await api('/unlock', { method: 'POST', body: JSON.stringify({ chapterId: data.chapter.id }) }); setAdChapter(null); load() }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${showBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-300 hover:text-webtoon"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{data.comic.title}</p><p className="text-xs text-zinc-500">Ch. {data.chapter.chapterNumber} — {data.chapter.title}</p></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-16">
        {data.pages.map((p) => <img key={p.id} src={p.imageUrl} loading="lazy" alt={`Page ${p.pageOrder}`} className="w-full block select-none" />)}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-between gap-3">
        <Button variant="outline" className="flex-1 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 gap-1" disabled={!data.prev} onClick={() => goChapter(data.prev)}><ChevronLeft className="h-4 w-4" /> {t('previous')}</Button>
        <Button className="flex-1 bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold gap-1" disabled={!data.next} onClick={() => goChapter(data.next)}>
          {data.next?.isLocked ? <><Lock className="h-4 w-4" /> {t('unlockCh', { n: data.next.chapterNumber })}</> : <>{t('next')} <ChevronRight className="h-4 w-4" /></>}
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        <h3 className="flex items-center gap-2 text-white font-bold mb-4"><MessageCircle className="h-5 w-5" /> {t('comments')} ({comments.length})</h3>
        <div className="flex gap-2 mb-6">
          <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={user ? t('writeComment') : t('signInToComment')} className="bg-zinc-900 border-zinc-800 focus-visible:ring-webtoon" onKeyDown={(e) => e.key === 'Enter' && postComment()} />
          <Button onClick={postComment} className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold">{t('send')}</Button>
        </div>
        <div className="space-y-4">
          {comments.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">{t('firstComment')}</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0"><AvatarImage src={c.userAvatar} /><AvatarFallback className="bg-webtoon text-zinc-950">{c.userName?.[0]}</AvatarFallback></Avatar>
              <div><div className="flex items-center gap-2"><span className="text-sm font-medium text-zinc-200">{c.userName}</span><span className="text-xs text-zinc-600">{new Date(c.createdAt).toLocaleDateString(dloc(lang))}</span></div><p className="text-sm text-zinc-400">{c.content}</p></div>
            </div>
          ))}
        </div>
      </div>

      <AdModal open={!!adChapter} chapter={adChapter} onClose={() => setAdChapter(null)} onComplete={completeAd} />
    </div>
  )
}

/* --------------------------- Creator Studio --------------------------- */
function CreatorView() {
  const { t } = useI18n()
  const [comics, setComics] = useState([])
  const [stats, setStats] = useState({ totalViews: 0, totalImpressions: 0, totalSeries: 0 })
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState({ title: '', synopsis: '', genre: 'Sci-Fi', coverImage: '' })
  const [chForm, setChForm] = useState({ comicId: '', title: '', isLocked: false, pages: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => { try { const d = await api('/creator/comics'); setComics(d.comics); setStats(d.stats) } catch (e) { toast.error(e.message) } }, [])
  useEffect(() => { load() }, [load])

  const createComic = async () => {
    if (!form.title || !form.coverImage) return toast.error(t('tTitleCover'))
    setSaving(true)
    try { await api('/comics', { method: 'POST', body: JSON.stringify(form) }); toast.success(t('tSeriesCreated')); setForm({ title: '', synopsis: '', genre: 'Sci-Fi', coverImage: '' }); setTab('list'); load() }
    catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }
  const createChapter = async () => {
    const pages = chForm.pages.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!chForm.comicId || pages.length === 0) return toast.error(t('tSelectPanels'))
    setSaving(true)
    try { await api('/chapters', { method: 'POST', body: JSON.stringify({ ...chForm, pages }) }); toast.success(t('tChapterAdded', { n: pages.length })); setChForm({ comicId: '', title: '', isLocked: false, pages: '' }); setTab('list'); load() }
    catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><PenSquare className="h-6 w-6 text-webtoon" /> {t('creatorStudio')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800 bg-zinc-900 gap-1" onClick={() => setTab('newChapter')}><Upload className="h-4 w-4" /> {t('uploadChapter')}</Button>
          <Button className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold gap-1" onClick={() => setTab('newComic')}><Plus className="h-4 w-4" /> {t('newSeries')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ l: t('totalSeries'), v: stats.totalSeries, i: BookOpen }, { l: t('totalReaders'), v: fmt(stats.totalViews), i: Eye }, { l: t('adImpressions'), v: fmt(stats.totalImpressions), i: Play }].map((s) => (
          <Card key={s.l} className="bg-zinc-900 border-zinc-800 p-4"><s.i className="h-5 w-5 text-webtoon mb-2" /><p className="text-2xl font-black text-white">{s.v}</p><p className="text-xs text-zinc-500">{s.l}</p></Card>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-2">
          {comics.length === 0 && <p className="text-zinc-500 text-sm py-8 text-center">{t('noSeries')}</p>}
          {comics.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 ring-1 ring-white/5">
              <img src={c.coverImage} className="w-12 h-16 object-cover rounded" alt="" />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{c.title}</p><p className="text-xs text-zinc-500">{c.chapterCount} {t('chapterWord')} • {fmt(c.views)} {t('viewsWord')}</p></div>
              <Badge className={`border-0 text-[10px] ${c.status === 'PUBLISHED' ? 'bg-webtoon/15 text-webtoon' : c.status === 'UNDER_REVIEW' ? 'bg-sunny/15 text-sunny' : 'bg-coral/15 text-coral'}`}>{c.status}</Badge>
              <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-950" onClick={() => { setChForm((f) => ({ ...f, comicId: c.id })); setTab('newChapter') }}>{t('addChapter')}</Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'newComic' && (
        <Card className="bg-zinc-900 border-zinc-800 p-5 space-y-4 max-w-xl">
          <h2 className="font-bold text-white">{t('createNewSeries')}</h2>
          <Input placeholder={t('comicTitle')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          <Textarea placeholder={t('synopsis')} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          <Select value={form.genre} onValueChange={(v) => setForm({ ...form, genre: v })}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
            <SelectContent>{GENRES.filter((g) => g !== 'All').map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder={t('coverUrl')} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          {form.coverImage && <img src={form.coverImage} className="w-24 aspect-[3/4] object-cover rounded" alt="" />}
          <div className="flex gap-2"><Button onClick={createComic} disabled={saving} className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('createSeries')}</Button><Button variant="ghost" onClick={() => setTab('list')}>{t('cancel')}</Button></div>
        </Card>
      )}

      {tab === 'newChapter' && (
        <Card className="bg-zinc-900 border-zinc-800 p-5 space-y-4 max-w-xl">
          <h2 className="font-bold text-white">{t('uploadNewChapter')}</h2>
          <Select value={chForm.comicId} onValueChange={(v) => setChForm({ ...chForm, comicId: v })}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue placeholder={t('selectSeries')} /></SelectTrigger>
            <SelectContent>{comics.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder={t('chapterTitleOpt')} value={chForm.title} onChange={(e) => setChForm({ ...chForm, title: e.target.value })} className="bg-zinc-950 border-zinc-800" />
          <Textarea rows={6} placeholder={t('panelsPlaceholder')} value={chForm.pages} onChange={(e) => setChForm({ ...chForm, pages: e.target.value })} className="bg-zinc-950 border-zinc-800 font-mono text-xs" />
          <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={chForm.isLocked} onChange={(e) => setChForm({ ...chForm, isLocked: e.target.checked })} className="accent-webtoon h-4 w-4" /> {t('lockThisChapter')}</label>
          <div className="flex gap-2"><Button onClick={createChapter} disabled={saving} className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('uploadChapterBtn')}</Button><Button variant="ghost" onClick={() => setTab('list')}>{t('cancel')}</Button></div>
        </Card>
      )}
    </div>
  )
}

/* --------------------------- Admin View --------------------------- */
function AdminView() {
  const { t } = useI18n()
  const [comics, setComics] = useState([])
  const load = useCallback(async () => { try { const d = await api('/admin/comics'); setComics(d.comics) } catch (e) { toast.error(e.message) } }, [])
  useEffect(() => { load() }, [load])
  const moderate = async (comicId, status) => { try { await api('/admin/moderate', { method: 'POST', body: JSON.stringify({ comicId, status }) }); toast.success(t('tStatus', { s: status })); load() } catch (e) { toast.error(e.message) } }

  const pending = comics.filter((c) => c.status === 'UNDER_REVIEW')
  const others = comics.filter((c) => c.status !== 'UNDER_REVIEW')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6"><Shield className="h-6 w-6 text-webtoon" /> {t('adminPanel')}</h1>
      <h2 className="text-sm font-semibold text-sunny mb-3">{t('pendingApproval')} ({pending.length})</h2>
      <div className="space-y-2 mb-8">
        {pending.length === 0 && <p className="text-zinc-500 text-sm">{t('noModeration')}</p>}
        {pending.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 ring-1 ring-sunny/20">
            <img src={c.coverImage} className="w-12 h-16 object-cover rounded" alt="" />
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{c.title}</p><p className="text-xs text-zinc-500 truncate">{c.creatorName} • {c.genre}</p></div>
            <Button size="sm" className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold gap-1" onClick={() => moderate(c.id, 'PUBLISHED')}><Check className="h-4 w-4" /> {t('approve')}</Button>
            <Button size="sm" variant="outline" className="border-coral/40 text-coral gap-1" onClick={() => moderate(c.id, 'REJECTED')}><Ban className="h-4 w-4" /> {t('reject')}</Button>
          </div>
        ))}
      </div>
      <h2 className="text-sm font-semibold text-zinc-400 mb-3">{t('allContent')} ({others.length})</h2>
      <div className="space-y-2">
        {others.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 ring-1 ring-white/5">
            <img src={c.coverImage} className="w-10 h-14 object-cover rounded" alt="" />
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{c.title}</p><p className="text-xs text-zinc-500">{c.creatorName}</p></div>
            <Badge className={`border-0 text-[10px] ${c.status === 'PUBLISHED' ? 'bg-webtoon/15 text-webtoon' : 'bg-coral/15 text-coral'}`}>{c.status}</Badge>
            {c.status !== 'PUBLISHED' && <Button size="sm" variant="ghost" className="text-webtoon" onClick={() => moderate(c.id, 'PUBLISHED')}>{t('publish')}</Button>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* --------------------------- Navbar --------------------------- */
function Navbar({ user, view, onNav, onLogin, onLogout, onRole }) {
  const { t, lang, setLang } = useI18n()
  return (
    <nav className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <button onClick={() => onNav('home')} className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-webtoon to-sunny flex items-center justify-center"><Sparkles className="h-5 w-5 text-zinc-950" /></div>
          <span className="font-black text-white text-lg tracking-tight">Komik<span className="text-webtoon">AI</span></span>
        </button>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-webtoon px-2 py-1 rounded-md" title="Language">
            <Globe className="h-4 w-4" /> {lang.toUpperCase()}
          </button>
          {user && ['CREATOR', 'ADMIN'].includes(user.role) && <Button variant="ghost" size="sm" className={view === 'creator' ? 'text-webtoon' : 'text-zinc-400'} onClick={() => onNav('creator')}>{t('studio')}</Button>}
          {user && user.role === 'ADMIN' && <Button variant="ghost" size="sm" className={view === 'admin' ? 'text-webtoon' : 'text-zinc-400'} onClick={() => onNav('admin')}>{t('admin')}</Button>}
          {!user ? (
            <Button size="sm" className="bg-webtoon hover:bg-webtoon-dark text-zinc-950 font-bold" onClick={onLogin}>{t('signIn')}</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={user.avatar} /><AvatarFallback className="bg-webtoon text-zinc-950 text-xs font-bold">{user.name?.[0]}</AvatarFallback></Avatar></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 w-56">
                <DropdownMenuLabel><p className="text-sm font-medium truncate">{user.name}</p><p className="text-xs text-zinc-500 truncate">{user.email}</p><Badge className="mt-1 bg-webtoon text-zinc-950 border-0 text-[10px] font-bold">{user.role}</Badge></DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuLabel className="text-[10px] text-zinc-500 font-normal">{t('roleDemo')}</DropdownMenuLabel>
                {['READER', 'CREATOR', 'ADMIN'].map((r) => (
                  <DropdownMenuItem key={r} onClick={() => onRole(r)} className="cursor-pointer">{user.role === r && <Check className="h-4 w-4 mr-2 text-webtoon" />}<span className={user.role === r ? '' : 'ml-6'}>{r}</span></DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-coral"><LogOut className="h-4 w-4 mr-2" /> {t('logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}

function AccessGate({ msg }) {
  return <div className="max-w-md mx-auto px-4 py-24 text-center"><Shield className="h-10 w-10 text-zinc-600 mx-auto mb-4" /><p className="text-zinc-400 text-sm">{msg}</p></div>
}

/* --------------------------- Root App --------------------------- */
function App() {
  const [mounted, setMounted] = useState(false)
  const [lang, setLangState] = useState('en')
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home')
  const [comicId, setComicId] = useState(null)
  const [chapterId, setChapterId] = useState(null)
  const [detailRefresh, setDetailRefresh] = useState(0)

  useEffect(() => {
    setMounted(true)
    try { const saved = localStorage.getItem('lang'); if (saved === 'id' || saved === 'en') { setLangState(saved); return } } catch {}
    setLangState(detectLang())
  }, [])
  const setLang = (l) => { setLangState(l); try { localStorage.setItem('lang', l) } catch {} }

  const loadUser = useCallback(async () => { try { const d = await api('/auth/me'); setUser(d.user) } catch (e) { setUser(null) } }, [])
  useEffect(() => { if (mounted) loadUser() }, [mounted, loadUser])

  const i18n = { t: (k, v) => { let s = (translations[lang] && translations[lang][k]) ?? translations.en[k] ?? k; if (v) for (const kk in v) s = s.replace(`{${kk}}`, v[kk]); return s }, lang, setLang }

  const login = () => { const redirect = `${window.location.origin}/auth/callback`; window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}` }
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); setView('home'); toast.success(i18n.t('tSignedOut')) }
  const setRole = async (role) => { try { const d = await api('/auth/role', { method: 'POST', body: JSON.stringify({ role }) }); setUser(d.user); toast.success(i18n.t('tRoleChanged', { r: role })) } catch (e) { toast.error(e.message) } }
  const loginNeeded = () => { toast.info(i18n.t('tSignInUnlock')); login() }
  const openComic = (id) => { setComicId(id); setView('detail'); window.scrollTo(0, 0) }
  const openReader = (id) => { setChapterId(id); setView('reader') }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-webtoon to-sunny flex items-center justify-center"><Sparkles className="h-5 w-5 text-zinc-950" /></div>
          <span className="font-black text-white text-xl tracking-tight">Komik<span className="text-webtoon">AI</span></span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-webtoon" />
      </div>
    )
  }

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {view !== 'reader' && <Navbar user={user} view={view} onNav={setView} onLogin={login} onLogout={logout} onRole={setRole} />}
        {view === 'home' && <HomeView onOpenComic={openComic} />}
        {view === 'detail' && comicId && <DetailView comicId={comicId} user={user} refreshKey={detailRefresh} onBack={() => setView('home')} onRead={openReader} onLoginNeeded={loginNeeded} />}
        {view === 'reader' && chapterId && <ReaderView chapterId={chapterId} user={user} onBack={() => { setDetailRefresh((n) => n + 1); setView('detail') }} onOpenChapter={openReader} onLoginNeeded={loginNeeded} />}
        {view === 'creator' && (user && ['CREATOR', 'ADMIN'].includes(user.role) ? <CreatorView /> : <AccessGate msg={i18n.t('gateCreator')} />)}
        {view === 'admin' && (user && user.role === 'ADMIN' ? <AdminView /> : <AccessGate msg={i18n.t('gateAdmin')} />)}
      </div>
    </I18nContext.Provider>
  )
}

export default App
