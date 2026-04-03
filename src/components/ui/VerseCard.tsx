import type { Verse } from '../../types'

interface VerseCardProps {
  verse: Verse
  totalVerses: number
  surahName: string
  fontSize?: number
  showTranslation?: boolean
}

/**
 * VerseCard — pure presentational component.
 *
 * Typography choices:
 * - Arabic: Amiri Quran, centered (text-center + dir="rtl"), raw text_uthmani
 *   preserving the U+06DD end ornament that the font renders natively.
 * - Translation: centered, clean (not italic), 17px #4A4540.
 * - Verse reference: centered, muted, in parentheses below translation.
 */
export default function VerseCard({
  verse,
  totalVerses,
  surahName,
  fontSize = 30,
  showTranslation = true,
}: VerseCardProps) {
  const [surahId, verseNum] = verse.verse_key.split(':')

  return (
    <div
      className="bg-white rounded-[24px] px-7 py-8 flex flex-col"
      style={{
        minHeight: '340px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Card header */}
      <div className="flex justify-between items-center mb-6">
        <span
          style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 500, letterSpacing: '0.04em' }}
        >
          {surahName}
        </span>
        <span
          style={{ fontSize: '12px', color: '#A8A29E', fontFamily: "'Amiri Quran', serif", direction: 'rtl' }}
        >
          صفحة {verse.page_number} | جزء {verse.juz_number}
        </span>
      </div>

      {/* Arabic text — centered, dir rtl, raw text_uthmani preserves U+06DD */}
      <div className="flex-1 flex items-center justify-center">
        <p
          dir="rtl"
          className="text-center w-full"
          style={{
            fontFamily: "'Amiri Quran', serif",
            fontSize: `${fontSize}px`,
            lineHeight: 2.6,
            color: '#1C1917',
            margin: 0,
          }}
        >
          {verse.text_uthmani}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0EDE8] my-5" />

      {/* Translation — centered, not italic */}
      {showTranslation && verse.translations?.[0] && (
        <div>
          <p
            className="text-center"
            style={{ fontSize: '17px', color: '#4A4540', lineHeight: 1.8, margin: 0 }}
            dangerouslySetInnerHTML={{ __html: verse.translations[0].text }}
          />
          {/* Verse reference below in parentheses */}
          <p
            className="text-center"
            style={{ fontSize: '15px', color: '#A8A29E', margin: '12px 0 0' }}
          >
            ({surahId}:{verseNum})
          </p>
        </div>
      )}

      {/* Verse ref when no translation */}
      {!showTranslation && (
        <p
          className="text-center"
          style={{ fontSize: '15px', color: '#A8A29E', margin: '0' }}
        >
          ({surahId}:{verseNum})
        </p>
      )}

      {/* Total context line */}
      <p
        className="text-center mt-2"
        style={{ fontSize: '11px', color: '#C9C5C0', letterSpacing: '0.02em' }}
      >
        of {totalVerses} verses
      </p>
    </div>
  )
}
