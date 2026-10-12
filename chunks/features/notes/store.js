import { signal, computed } from '../../core/signals.js';
export const notes = signal([
{
id: 'note_1',
title: 'Architecture Review',
content: 'Native PWA built on Web Standards: Import Maps, Custom Elements, View Transitions.',
archived: false
},
{
id: 'note_2',
title: 'Micro-Signals Benchmarking',
content: 'Zero-VDOM reactivity achieves sub-millisecond updates and sub-1MB memory overhead.',
archived: false
}
]);
export const activeNoteId = signal('note_1');
export const selectedNote = computed(() => {
const id = activeNoteId.value;
if (!id) return null;
return notes.value.find((n) => n.id === id) || null;
});
export function selectNote(id) {
activeNoteId.value = id;
}
export function addNote(title, content = '') {
const newNote = {
id: `note_${Date.now()}`,
title: title.trim() || 'Untitled Note',
content,
archived: false
};
notes.update((current) => [newNote, ...current]);
activeNoteId.value = newNote.id;
return newNote;
}
export function deleteNote(id) {
notes.update((current) => current.filter((n) => n.id !== id));
if (activeNoteId.value === id) {
activeNoteId.value = notes.value[0]?.id || null;
}
}
export function archiveNote(id) {
notes.update((current) =>
current.map((n) => (n.id === id ? { ...n, archived: true } : n))
);
}