import type { Verse } from '../../types'

interface VerseCardProps {
  verse: Verse
  totalVerses: number
  surahName: string
  fontSize?: number
  showTranslation?: boolean
}

export default function VerseCard({
  verse,
  totalVerses,
  surahName,
  fontSize = 28,
  showTranslation = true,
}: VerseCardProps) {
  const [surahId, verseNum] = verse.verse_key.split(':')

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '320px',
      }}
    >
      {/* Page/Juz info */}
      <div
        style={{
          textAlign: 'right',
          direction: 'rtl',
          fontSize: '12px',
          color: '#9B9690',
          fontFamily: 'var(--font-arabic)',
          letterSpacing: '0.02em',
        }}
      >
        صفحة {verse.page_number} | جزء {verse.juz_number}
      </div>

      {/* Arabic text */}
      <div
        style={{
          fontFamily: "'Amiri Quran', 'Traditional Arabic', serif",
          fontSize: `${fontSize}px`,
          lineHeight: 2.4,
          direction: 'rtl',
          textAlign: 'right',
          color: '#1C1917',
          wordSpacing: '4px',
        }}
      >
        {verse.text_uthmani}
        {' '}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid #5C8B61',
            fontSize: '11px',
            color: '#5C8B61',
            fontFamily: "'Amiri Quran', serif",
            verticalAlign: 'middle',
            marginRight: '4px',
          }}
        >
          {verseNum}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#E8DDD0', margin: '0 -4px' }} />

      {/* Translation */}
      {showTranslation && verse.translations?.[0] && (
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.7,
            color: '#6B6560',
            fontStyle: 'italic',
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: verse.translations[0].text }}
        />
      )}

      {/* Caption */}
      <div
        style={{
          fontSize: '12px',
          color: '#9B9690',
          marginTop: 'auto',
          fontWeight: 500,
        }}
      >
        Verse {surahId}:{verseNum} of {totalVerses} — {surahName}
      </div>
    </div>
  )
}
