export function MetaNav() {
  return (
    <nav className="meta-nav" aria-label="IEEE websites" lang="en" dir="ltr">
      <div className="meta-network">
        <a href="https://www.ieee.org">IEEE.org</a>
        <span aria-hidden="true">|</span>
        <a href="https://ieeexplore.ieee.org">
          IEEE <i>Xplore</i>®
        </a>
        <span aria-hidden="true">|</span>
        <a href="https://standards.ieee.org">IEEE Standards</a>
        <span aria-hidden="true">|</span>
        <a href="https://spectrum.ieee.org">IEEE Spectrum</a>
        <span aria-hidden="true">|</span>
        <a href="https://www.ieee.org/sitemap">More Sites</a>
      </div>
      <div className="meta-membership">
        <a href="https://www.ieee.org/join">Join IEEE</a>
        <a href="https://www.ieee.org/give">Donate</a>
      </div>
    </nav>
  );
}
