let locks = 0;
let originalOverflow = '';
let originalPadding = '';
export function lockScroll() {
  if (locks++ === 0) {
    originalOverflow = document.body.style.overflow;
    originalPadding = document.body.style.paddingInlineEnd;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const padding = Number.parseFloat(getComputedStyle(document.body).paddingInlineEnd) || 0;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingInlineEnd = `${padding + scrollbar}px`;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingInlineEnd = originalPadding;
    }
  };
}
