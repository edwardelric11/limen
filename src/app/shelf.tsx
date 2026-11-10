import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { BOOKS, bookById, booksIn, COLLECTIONS, START_SHELF } from '@/data';
import { BookRow, Screen, ShelfTile } from '@/ui/blocks';
import { T } from '@/ui/kit';

// The full bookshelf, one collection at a time.
export default function Shelf() {
  const params = useLocalSearchParams<{ col?: string }>();
  const [col, setCol] = useState<string>(params.col && COLLECTIONS[params.col] ? params.col : 'start');
  const list = col === 'start' ? START_SHELF.map(id => bookById[id]) : booksIn(col).sort((a, b) => a.y - b.y);
  return (
    <Screen back title="Books" sub={`${BOOKS.length} books, by genre.`} bottom={40}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 18 }}>
        <ShelfTile id="start" label="Start here" selected={col === 'start'} onPress={() => setCol('start')} />
        {Object.entries(COLLECTIONS).map(([k, v]) => <ShelfTile key={k} id={k} label={v} selected={col === k} onPress={() => setCol(k)} />)}
      </ScrollView>
      <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>{col === 'start' ? 'Ten good first books' : `${list.length} books, oldest first`}</T>
      {list.map((b, i) => <BookRow key={b.id} b={b} first={i === 0} />)}
    </Screen>
  );
}
