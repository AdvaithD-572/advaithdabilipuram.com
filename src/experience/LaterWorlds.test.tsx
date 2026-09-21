import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { copyContactEmail, LaterWorlds, pointerOffset } from './LaterWorlds';

describe('later worlds', () => {
  it('clamps pointer depth at the artwork boundary and handles empty geometry', () => {
    expect(pointerOffset(-400, 0, 100, 8)).toBe(-8);
    expect(pointerOffset(400, 0, 100, 8)).toBe(8);
    expect(pointerOffset(50, 0, 100, 8)).toBe(0);
    expect(pointerOffset(20, 0, 0, 8)).toBe(0);
  });

  it('reports clipboard errors without claiming that copying succeeded', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    expect(await copyContactEmail({ writeText })).toBe(false);
    expect(await copyContactEmail(undefined)).toBe(false);
  });

  it('copies the exact address while retaining a normal email link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await copyContactEmail({ writeText })).toBe(true);
    expect(writeText).toHaveBeenCalledWith('dabilipuramadvaith@gmail.com');
    const markup = renderToStaticMarkup(<LaterWorlds reducedMotion />);
    expect(markup).toContain('href="mailto:dabilipuramadvaith@gmail.com"');
    expect(markup).toContain('aria-live="polite"');
    for (const id of ['about', 'skills', 'services', 'credibility', 'contact']) {
      expect(markup).toContain(`id="${id}"`);
    }
    expect(markup.match(/tabindex="-1"/g)).toHaveLength(5);
    expect(markup.match(/data-world-label=/g)).toHaveLength(5);
    expect(markup).not.toContain('sports-intelligence-frame');
  });

  it('keeps the email, social links and footer inside the telephone scene', () => {
    const markup = renderToStaticMarkup(<LaterWorlds reducedMotion />);
    const scene = markup.slice(markup.indexOf('class="contact-scene"'));
    expect(scene).toMatch(/class="contact-floor">[\s\S]*class="contact-details later-shell"[\s\S]*class="contact-footer later-shell"[\s\S]*<\/footer><\/div><\/div><\/section>/);
  });
});
