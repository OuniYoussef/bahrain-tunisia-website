import { StrictMode, useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import common from '@/content/locales/en/common.json';
import { ContentProvider } from '@/i18n/ContentProvider';
import { Dialog, DialogClose } from './Dialog';

// jsdom has no browser top layer. These mocks only implement open/close; real focus
// containment, Escape and native tab order are exercised in Playwright.
const originalMethods = Object.getOwnPropertyDescriptors(HTMLDialogElement.prototype);
beforeAll(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = true;
      }),
    },
    close: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = false;
      }),
    },
  });
});
afterAll(() => {
  for (const name of ['showModal', 'close']) {
    const original = originalMethods[name];
    if (original) Object.defineProperty(HTMLDialogElement.prototype, name, original);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

function Harness({ initial = false }: { initial?: boolean }) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <ContentProvider locale="en" content={{ common }}>
      <button onClick={() => setOpen(true)}>{common.ui.readMore}</button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={common.contact.title}
        initialFocus={initial ? input : undefined}
      >
        <input ref={input} aria-label={common.footer.newsletter.emailLabel} />
        <DialogClose>{common.ui.close}</DialogClose>
      </Dialog>
    </ContentProvider>
  );
}
describe('Dialog focus lifecycle', () => {
  it('focuses its heading, locks scroll, then returns focus and original styles on close', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';
    document.body.style.paddingInlineEnd = '7px';
    render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
    const trigger = screen.getByRole('button', { name: common.ui.readMore });
    await user.click(trigger);
    expect(screen.getByRole('heading', { name: common.contact.title })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getAllByRole('button', { name: common.ui.close })[1]!);
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingInlineEnd).toBe('7px');
    document.body.removeAttribute('style');
  });
  it('honours an explicit initial focus and the native cancel event', async () => {
    const user = userEvent.setup();
    render(<Harness initial />);
    const trigger = screen.getByRole('button', { name: common.ui.readMore });
    await user.click(trigger);
    expect(screen.getByRole('textbox')).toHaveFocus();
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('releases scroll lock and returns focus to a surviving external trigger on unmount', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = render(
      <ContentProvider locale="en" content={{ common }}>
        <Dialog open onOpenChange={() => {}} title={common.contact.title}>
          <p>{common.contact.text}</p>
        </Dialog>
      </ContentProvider>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).not.toBe('hidden');
    trigger.remove();
  });
});
