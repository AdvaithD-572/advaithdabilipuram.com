import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RouteIntro } from './RouteIntro';

describe('RouteIntro', () => {
  it('keeps the parallax backdrop and reveal content in separate layers', () => {
    const markup = renderToStaticMarkup(<RouteIntro label="ABOUT" />);
    expect(markup).toContain('class="route-intro__parallax"');
    expect(markup).toContain('class="route-intro__content"');
    expect(markup).toContain('class="route-intro__eyebrow"');
    expect(markup.indexOf('route-intro__parallax')).toBeLessThan(markup.indexOf('route-intro__content'));
  });
});
