import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import { useChapters, useJuzs } from '../hooks/useQuranApi'

type Tab = 'surah' | 'juz' | 'page'

function arabicNumeral(n: number): string {
  const arabic = '٠١٢٣٤٥٦٧٨٩'
  return String(n).replace(/\d/g, (d) => arabic[parseInt(d)])
}

export default function QuranBrowser() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('surah')
  const [searchQuery, setSearchQuery] = useState('')

  const { chapters, loading: chaptersLoading } = useChapters()
  const { juzs, loading: juzsLoading } = useJuzs()

  const filteredChapters = chapters.filter(
    (c) =>
      c.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name_arabic.includes(searchQuery) ||
      String(c.id).includes(searchQuery)
  )

  const tabStyle = (tab: Tab) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: activeTab === tab ? '#5C8B61' : 'transparent',
    color: activeTab === tab ? '#FFFFFF' : '#6B6560',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  })

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#F9F5EE',
        paddingBottom: '80px',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ padding: '56px 24px 16px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1C1917',
            margin: '0 0 20px',
          }}
        >
          Quran
        </h1>

        {/* Search */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #E8DDD0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <Search size={18} color="#9B9690" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search surahs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '13px 0',
              fontSize: '15px',
              color: '#1C1917',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        {/* Segmented control */}
        <div
          style={{
            background: '#F2EBE0',
            borderRadius: '12px',
            padding: '4px',
            display: 'flex',
            gap: '2px',
          }}
        >
          {(['surah', 'juz', 'page'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        {activeTab === 'surah' && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}
          >
            {chaptersLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #F2EBE0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F2EBE0' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '14px', background: '#F2EBE0', borderRadius: '4px', width: '40%', marginBottom: '6px' }} />
                    <div style={{ height: '12px', background: '#F2EBE0', borderRadius: '4px', width: '25%' }} />
                  </div>
                </div>
              ))
            ) : (
              filteredChapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => navigate(`/read?page=${chapter.pages[0]}`)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderBottom: idx < filteredChapters.length - 1 ? '1px solid #F2EBE0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    borderBottomWidth: idx < filteredChapters.length - 1 ? '1px' : '0',
                    borderBottomStyle: 'solid',
                    borderBottomColor: '#F2EBE0',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                  }}
                >
                  {/* Number circle */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1.5px solid #E8DDD0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B6560' }}>
                      {chapter.id}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2px',
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>
                        {chapter.name_simple}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Amiri Quran', serif",
                          fontSize: '18px',
                          color: '#5C8B61',
                          direction: 'rtl',
                        }}
                      >
                        {chapter.name_arabic}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#6B6560' }}>
                        {chapter.verses_count} verses · Pages {chapter.pages[0]}–{chapter.pages[1]}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Amiri Quran', serif",
                          fontSize: '13px',
                          color: '#9B9690',
                          direction: 'rtl',
                        }}
                      >
                        {arabicNumeral(chapter.id)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'juz' && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}
          >
            {juzsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #F2EBE0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F2EBE0' }} />
                  <div style={{ height: '14px', background: '#F2EBE0', borderRadius: '4px', width: '50%' }} />
                </div>
              ))
            ) : (
              juzs.map((juz, idx) => {
                // Get the first surah/verse in this juz
                const firstEntry = Object.entries(juz.verse_mapping)[0]
                return (
                  <button
                    key={juz.id}
                    onClick={() => {
                      // Navigate to page where juz starts (approximate)
                      const page = Math.round(((juz.id - 1) / 30) * 604) + 1
                      navigate(`/read?page=${Math.min(604, page)}`)
                    }}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: idx < juzs.length - 1 ? '1px solid #F2EBE0' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: '#F0F7F1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#5C8B61' }}>
                        {juz.id}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>
                        Juz {juz.id}
                      </div>
                      {firstEntry && (
                        <div style={{ fontSize: '12px', color: '#6B6560', marginTop: '2px' }}>
                          Surah {firstEntry[0]} · {juz.verses_count} verses
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'page' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}
          >
            {Array.from({ length: 604 }).map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => navigate(`/read?page=${page}`)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '10px',
                    border: '1.5px solid #E8DDD0',
                    background: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6B6560',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {page}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
