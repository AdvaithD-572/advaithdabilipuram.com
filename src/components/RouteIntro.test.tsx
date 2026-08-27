import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RouteIntro } from './RouteIntro';

describe('RouteIntro', () => {
  it('keeps the eyebrow in a dedicated layer above the pressure title', () => {
    const markup = renderToStaticMarkup(<RouteIntro label="ABOUT" />);
    expect(markup).toContain('class="route-intro__eyebrow"');
    expect(markup.indexOf('route-intro__eyebrow')).toBeLessThan(markup.indexOf('text-pressure'));
  });
});
