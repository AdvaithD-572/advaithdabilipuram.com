import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardNav } from './Chrome';

describe('CardNav', () => {
  it('includes a lowercase home mark linked to the homepage', () => {
    const markup = renderToStaticMarkup(<CardNav />);

    expect(markup).toContain('class="home-mark"');
    expect(markup).toContain('href="/"');
    expect(markup).toContain('aria-label="Home"');
    expect(markup).toContain('>a</a>');
  });
});
